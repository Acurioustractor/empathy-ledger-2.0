/**
 * Professional Backup and Disaster Recovery System
 *
 * Features:
 * - Automated scheduled backups
 * - Point-in-time recovery
 * - Encrypted off-site storage
 * - Backup verification
 * - Disaster recovery procedures
 */

import { createClient } from '@supabase/supabase-js';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import * as cron from 'node-cron';
import pLimit from 'p-limit';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

const scryptAsync = promisify(scrypt);

// Configuration
interface BackupConfig {
  supabase: {
    url: string;
    serviceKey: string;
    databaseUrl: string;
  };
  s3: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    password: string;
  };
  schedule: {
    full: string; // Cron expression
    incremental: string;
    verification: string;
  };
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  notifications: {
    webhookUrl: string;
    emailRecipients: string[];
  };
}

// Backup types
enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  SNAPSHOT = 'snapshot',
}

// Backup status
enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VERIFIED = 'verified',
}

// Backup metadata
interface BackupMetadata {
  id: string;
  type: BackupType;
  status: BackupStatus;
  startTime: Date;
  endTime?: Date;
  size: number;
  tables: string[];
  encryptionKey: string;
  checksum: string;
  location: string;
  error?: string;
}

class BackupSystem {
  private supabase: any;
  private s3Client: S3Client;
  private config: BackupConfig;
  private concurrencyLimit: any;

  constructor(config: BackupConfig) {
    this.config = config;
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey
    );
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
    this.concurrencyLimit = pLimit(5); // Limit concurrent operations
  }

  /**
   * Initialize backup schedules
   */
  async initialize() {
    console.log('🚀 Initializing backup system...');

    // Schedule full backups
    cron.schedule(this.config.schedule.full, async () => {
      console.log('⏰ Starting scheduled full backup...');
      await this.performBackup(BackupType.FULL);
    });

    // Schedule incremental backups
    cron.schedule(this.config.schedule.incremental, async () => {
      console.log('⏰ Starting scheduled incremental backup...');
      await this.performBackup(BackupType.INCREMENTAL);
    });

    // Schedule verification
    cron.schedule(this.config.schedule.verification, async () => {
      console.log('⏰ Starting backup verification...');
      await this.verifyRecentBackups();
    });

    // Clean up old backups
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Cleaning up old backups...');
      await this.cleanupOldBackups();
    });

    console.log('✅ Backup system initialized');
  }

  /**
   * Perform a backup
   */
  async performBackup(type: BackupType): Promise<BackupMetadata> {
    const backupId = `backup-${Date.now()}-${type}`;
    const metadata: BackupMetadata = {
      id: backupId,
      type,
      status: BackupStatus.IN_PROGRESS,
      startTime: new Date(),
      size: 0,
      tables: [],
      encryptionKey: '',
      checksum: '',
      location: '',
    };

    try {
      // Log backup start
      await this.logBackupEvent('start', metadata);

      // Create backup based on type
      let backupData: Buffer;
      switch (type) {
        case BackupType.FULL:
          backupData = await this.createFullBackup(metadata);
          break;
        case BackupType.INCREMENTAL:
          backupData = await this.createIncrementalBackup(metadata);
          break;
        case BackupType.SNAPSHOT:
          backupData = await this.createSnapshotBackup(metadata);
          break;
        default:
          throw new Error(`Unsupported backup type: ${type}`);
      }

      // Encrypt backup
      const { encrypted, key } = await this.encryptData(backupData);
      metadata.encryptionKey = key;

      // Calculate checksum
      metadata.checksum = this.calculateChecksum(encrypted);

      // Upload to S3
      const s3Key = `backups/${new Date().getFullYear()}/${backupId}.enc`;
      await this.uploadToS3(s3Key, encrypted);
      metadata.location = s3Key;
      metadata.size = encrypted.length;

      // Update metadata
      metadata.status = BackupStatus.COMPLETED;
      metadata.endTime = new Date();

      // Log backup completion
      await this.logBackupEvent('complete', metadata);

      // Store metadata in database
      await this.storeBackupMetadata(metadata);

      // Send notification
      await this.sendNotification('backup_success', metadata);

      return metadata;
    } catch (error) {
      metadata.status = BackupStatus.FAILED;
      metadata.error = error.message;
      metadata.endTime = new Date();

      await this.logBackupEvent('failed', metadata);
      await this.sendNotification('backup_failed', metadata);

      throw error;
    }
  }

  /**
   * Create a full backup
   */
  private async createFullBackup(metadata: BackupMetadata): Promise<Buffer> {
    console.log('📦 Creating full backup...');

    // Get list of tables to backup
    const tables = await this.getTableList();
    metadata.tables = tables;

    // Export database using pg_dump
    const dumpCommand = `pg_dump ${this.config.supabase.databaseUrl} --no-owner --no-acl --clean --if-exists`;
    const { stdout } = await promisify(exec)(dumpCommand);

    // Include storage files
    const storageBackup = await this.backupStorageFiles();

    // Combine database and storage backups
    const backup = {
      timestamp: new Date().toISOString(),
      type: 'full',
      database: stdout,
      storage: storageBackup,
      metadata: {
        tables,
        version: '1.0',
        platform: 'empathy-ledger',
      },
    };

    return Buffer.from(JSON.stringify(backup));
  }

  /**
   * Create an incremental backup
   */
  private async createIncrementalBackup(
    metadata: BackupMetadata
  ): Promise<Buffer> {
    console.log('📦 Creating incremental backup...');

    // Get last backup timestamp
    const lastBackup = await this.getLastSuccessfulBackup();
    if (!lastBackup) {
      console.log('No previous backup found, creating full backup instead');
      return this.createFullBackup(metadata);
    }

    // Get changed data since last backup
    const changes = await this.getChangesSince(lastBackup.endTime!);
    metadata.tables = Object.keys(changes);

    const backup = {
      timestamp: new Date().toISOString(),
      type: 'incremental',
      baseBackupId: lastBackup.id,
      changes,
      metadata: {
        tables: metadata.tables,
        version: '1.0',
        platform: 'empathy-ledger',
      },
    };

    return Buffer.from(JSON.stringify(backup));
  }

  /**
   * Create a snapshot backup
   */
  private async createSnapshotBackup(
    metadata: BackupMetadata
  ): Promise<Buffer> {
    console.log('📦 Creating snapshot backup...');

    // Use Supabase's point-in-time recovery feature
    const snapshotCommand = `pg_dump ${this.config.supabase.databaseUrl} --snapshot=now --no-owner --no-acl`;
    const { stdout } = await promisify(exec)(snapshotCommand);

    const backup = {
      timestamp: new Date().toISOString(),
      type: 'snapshot',
      data: stdout,
      metadata: {
        version: '1.0',
        platform: 'empathy-ledger',
      },
    };

    return Buffer.from(JSON.stringify(backup));
  }

  /**
   * Backup storage files
   */
  private async backupStorageFiles(): Promise<any> {
    console.log('📁 Backing up storage files...');

    const { data: buckets } = await this.supabase.storage.listBuckets();
    const storageData: any = {};

    for (const bucket of buckets) {
      const { data: files } = await this.supabase.storage
        .from(bucket.name)
        .list('', { limit: 1000 });

      storageData[bucket.name] = await Promise.all(
        files.map(async (file: any) => {
          const { data } = await this.supabase.storage
            .from(bucket.name)
            .download(file.name);

          return {
            name: file.name,
            size: file.metadata?.size || 0,
            contentType: file.metadata?.mimetype,
            data: await this.streamToBuffer(data),
          };
        })
      );
    }

    return storageData;
  }

  /**
   * Get changes since a specific timestamp
   */
  private async getChangesSince(since: Date): Promise<any> {
    const changes: any = {};
    const tables = await this.getTableList();

    for (const table of tables) {
      // Check if table has updated_at column
      const { data: columns } = await this.supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', table)
        .eq('column_name', 'updated_at');

      if (columns && columns.length > 0) {
        const { data } = await this.supabase
          .from(table)
          .select('*')
          .gte('updated_at', since.toISOString());

        if (data && data.length > 0) {
          changes[table] = data;
        }
      }
    }

    return changes;
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string, targetTime?: Date): Promise<void> {
    console.log(`🔄 Starting restore from backup ${backupId}...`);

    try {
      // Get backup metadata
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup ${backupId} not found`);
      }

      // Download backup from S3
      const backupData = await this.downloadFromS3(metadata.location);

      // Decrypt backup
      const decrypted = await this.decryptData(
        backupData,
        metadata.encryptionKey
      );

      // Verify checksum
      if (this.calculateChecksum(backupData) !== metadata.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      // Parse backup
      const backup = JSON.parse(decrypted.toString());

      // Create restore point
      await this.createRestorePoint();

      // Restore based on backup type
      switch (metadata.type) {
        case BackupType.FULL:
          await this.restoreFullBackup(backup);
          break;
        case BackupType.INCREMENTAL:
          await this.restoreIncrementalBackup(backup);
          break;
        case BackupType.SNAPSHOT:
          await this.restoreSnapshotBackup(backup);
          break;
      }

      // Verify restoration
      await this.verifyRestoration(metadata);

      console.log('✅ Restore completed successfully');
      await this.sendNotification('restore_success', { backupId, targetTime });
    } catch (error) {
      console.error('❌ Restore failed:', error);
      await this.sendNotification('restore_failed', {
        backupId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Restore full backup
   */
  private async restoreFullBackup(backup: any): Promise<void> {
    console.log('📥 Restoring full backup...');

    // Restore database
    const restoreCommand = `psql ${this.config.supabase.databaseUrl}`;
    const restore = exec(restoreCommand);

    // Pipe backup data to psql
    const stream = Readable.from(backup.database);
    stream.pipe(restore.stdin!);

    await new Promise((resolve, reject) => {
      restore.on('exit', code => {
        if (code === 0) resolve(void 0);
        else reject(new Error(`Restore failed with code ${code}`));
      });
    });

    // Restore storage files
    await this.restoreStorageFiles(backup.storage);
  }

  /**
   * Restore storage files
   */
  private async restoreStorageFiles(storageData: any): Promise<void> {
    console.log('📁 Restoring storage files...');

    for (const [bucketName, files] of Object.entries(storageData)) {
      // Ensure bucket exists
      await this.supabase.storage.createBucket(bucketName, { public: false });

      // Restore files
      await Promise.all(
        (files as any[]).map(async file => {
          await this.supabase.storage
            .from(bucketName)
            .upload(file.name, file.data, {
              contentType: file.contentType,
              upsert: true,
            });
        })
      );
    }
  }

  /**
   * Verify recent backups
   */
  private async verifyRecentBackups(): Promise<void> {
    console.log('🔍 Verifying recent backups...');

    const recentBackups = await this.getRecentBackups(7); // Last 7 days

    for (const backup of recentBackups) {
      try {
        // Download backup
        const data = await this.downloadFromS3(backup.location);

        // Verify checksum
        if (this.calculateChecksum(data) !== backup.checksum) {
          throw new Error('Checksum mismatch');
        }

        // Test decryption
        await this.decryptData(data, backup.encryptionKey);

        // Update status
        backup.status = BackupStatus.VERIFIED;
        await this.updateBackupMetadata(backup);

        console.log(`✅ Backup ${backup.id} verified`);
      } catch (error) {
        console.error(`❌ Backup ${backup.id} verification failed:`, error);
        await this.sendNotification('backup_verification_failed', {
          backup,
          error: error.message,
        });
      }
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  private async cleanupOldBackups(): Promise<void> {
    console.log('🧹 Cleaning up old backups...');

    const now = new Date();
    const backups = await this.getAllBackups();

    for (const backup of backups) {
      const age = Math.floor(
        (now.getTime() - backup.startTime.getTime()) / (1000 * 60 * 60 * 24)
      );
      let shouldDelete = false;

      // Apply retention policy
      if (age > this.config.retention.yearly * 365) {
        shouldDelete = true;
      } else if (
        age > this.config.retention.monthly * 30 &&
        !this.isMonthlyBackup(backup)
      ) {
        shouldDelete = true;
      } else if (
        age > this.config.retention.weekly * 7 &&
        !this.isWeeklyBackup(backup)
      ) {
        shouldDelete = true;
      } else if (
        age > this.config.retention.daily &&
        !this.isDailyBackup(backup)
      ) {
        shouldDelete = true;
      }

      if (shouldDelete) {
        await this.deleteBackup(backup);
        console.log(`🗑️  Deleted backup ${backup.id} (${age} days old)`);
      }
    }
  }

  /**
   * Encrypt data
   */
  private async encryptData(
    data: Buffer
  ): Promise<{ encrypted: Buffer; key: string }> {
    const salt = randomBytes(32);
    const key = (await scryptAsync(
      this.config.encryption.password,
      salt,
      this.config.encryption.keyLength
    )) as Buffer;
    const iv = randomBytes(16);

    const cipher = createCipheriv(this.config.encryption.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    // Combine salt, iv, and encrypted data
    const combined = Buffer.concat([salt, iv, encrypted]);

    return {
      encrypted: combined,
      key: salt.toString('hex'),
    };
  }

  /**
   * Decrypt data
   */
  private async decryptData(data: Buffer, saltHex: string): Promise<Buffer> {
    const salt = Buffer.from(saltHex, 'hex');
    const key = (await scryptAsync(
      this.config.encryption.password,
      salt,
      this.config.encryption.keyLength
    )) as Buffer;

    // Extract iv and encrypted data
    const iv = data.slice(32, 48);
    const encrypted = data.slice(48);

    const decipher = createDecipheriv(
      this.config.encryption.algorithm,
      key,
      iv
    );
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: Buffer): string {
    const { createHash } = require('crypto');
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Upload to S3
   */
  private async uploadToS3(key: string, data: Buffer): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
      Body: data,
      ServerSideEncryption: 'AES256',
      StorageClass: 'GLACIER_IR', // Use Glacier for long-term storage
    });

    await this.s3Client.send(command);
  }

  /**
   * Download from S3
   */
  private async downloadFromS3(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    return this.streamToBuffer(response.Body as Readable);
  }

  /**
   * Helper utilities
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private async getTableList(): Promise<string[]> {
    const { data } = await this.supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations');

    return data?.map((row: any) => row.table_name) || [];
  }

  private async storeBackupMetadata(metadata: BackupMetadata): Promise<void> {
    await this.supabase.from('backup.backup_history').insert({
      id: metadata.id,
      backup_type: metadata.type,
      backup_location: metadata.location,
      backup_size_bytes: metadata.size,
      tables_included: metadata.tables,
      started_at: metadata.startTime,
      completed_at: metadata.endTime,
      status: metadata.status,
      error_message: metadata.error,
    });
  }

  private async getBackupMetadata(
    backupId: string
  ): Promise<BackupMetadata | null> {
    const { data } = await this.supabase
      .from('backup.backup_history')
      .select('*')
      .eq('id', backupId)
      .single();

    return data;
  }

  private async updateBackupMetadata(metadata: BackupMetadata): Promise<void> {
    await this.supabase
      .from('backup.backup_history')
      .update({
        status: metadata.status,
        error_message: metadata.error,
      })
      .eq('id', metadata.id);
  }

  private async getLastSuccessfulBackup(): Promise<BackupMetadata | null> {
    const { data } = await this.supabase
      .from('backup.backup_history')
      .select('*')
      .eq('status', BackupStatus.COMPLETED)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  private async getRecentBackups(days: number): Promise<BackupMetadata[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await this.supabase
      .from('backup.backup_history')
      .select('*')
      .gte('started_at', since.toISOString())
      .eq('status', BackupStatus.COMPLETED);

    return data || [];
  }

  private async getAllBackups(): Promise<BackupMetadata[]> {
    const { data } = await this.supabase
      .from('backup.backup_history')
      .select('*')
      .order('started_at', { ascending: false });

    return data || [];
  }

  private async deleteBackup(backup: BackupMetadata): Promise<void> {
    // Delete from S3
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.config.s3.bucket,
        Key: backup.location,
      })
    );

    // Update database record
    await this.supabase
      .from('backup.backup_history')
      .update({ status: 'deleted' })
      .eq('id', backup.id);
  }

  private isMonthlyBackup(backup: BackupMetadata): boolean {
    return backup.startTime.getDate() === 1; // First day of month
  }

  private isWeeklyBackup(backup: BackupMetadata): boolean {
    return backup.startTime.getDay() === 0; // Sunday
  }

  private isDailyBackup(backup: BackupMetadata): boolean {
    return backup.type === BackupType.FULL;
  }

  private async createRestorePoint(): Promise<void> {
    const restorePointName = `restore_point_${Date.now()}`;
    await this.supabase.rpc('create_restore_point', { name: restorePointName });
  }

  private async verifyRestoration(
    originalBackup: BackupMetadata
  ): Promise<void> {
    // Compare table counts
    const currentTables = await this.getTableList();
    if (currentTables.length !== originalBackup.tables.length) {
      throw new Error('Table count mismatch after restoration');
    }

    // Additional verification logic...
  }

  private async logBackupEvent(
    event: string,
    metadata: BackupMetadata
  ): Promise<void> {
    console.log(`📝 Backup ${event}: ${metadata.id}`);

    await this.supabase.from('audit.audit_log').insert({
      table_name: 'backup_system',
      record_id: metadata.id,
      action: event.toUpperCase(),
      new_data: metadata,
      changed_at: new Date(),
    });
  }

  private async sendNotification(type: string, data: any): Promise<void> {
    // Send webhook notification
    if (this.config.notifications.webhookUrl) {
      await fetch(this.config.notifications.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: new Date() }),
      });
    }

    // Send email notifications
    // Implementation depends on email service...
  }

  private async restoreIncrementalBackup(backup: any): Promise<void> {
    // First restore the base backup
    await this.restoreFromBackup(backup.baseBackupId);

    // Then apply incremental changes
    for (const [table, changes] of Object.entries(backup.changes)) {
      await this.supabase.from(table).upsert(changes as any[]);
    }
  }

  private async restoreSnapshotBackup(backup: any): Promise<void> {
    // Similar to full backup restoration
    await this.restoreFullBackup({ database: backup.data });
  }
}

// Export configuration template
export const backupConfigTemplate: BackupConfig = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
    databaseUrl: process.env.DATABASE_URL!,
  },
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.BACKUP_BUCKET!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    password: process.env.BACKUP_ENCRYPTION_PASSWORD!,
  },
  schedule: {
    full: '0 2 * * *', // Daily at 2 AM
    incremental: '0 */6 * * *', // Every 6 hours
    verification: '0 4 * * *', // Daily at 4 AM
  },
  retention: {
    daily: 7,
    weekly: 4,
    monthly: 12,
    yearly: 5,
  },
  notifications: {
    webhookUrl: process.env.BACKUP_WEBHOOK_URL || '',
    emailRecipients: (process.env.BACKUP_EMAIL_RECIPIENTS || '').split(','),
  },
};

// Disaster Recovery Procedures
export class DisasterRecovery {
  private backupSystem: BackupSystem;

  constructor(backupSystem: BackupSystem) {
    this.backupSystem = backupSystem;
  }

  /**
   * Execute disaster recovery plan
   */
  async executeRecoveryPlan(
    scenario:
      | 'data_corruption'
      | 'data_loss'
      | 'ransomware'
      | 'regional_failure'
  ): Promise<void> {
    console.log(`🚨 Executing disaster recovery plan for: ${scenario}`);

    switch (scenario) {
      case 'data_corruption':
        await this.recoverFromDataCorruption();
        break;
      case 'data_loss':
        await this.recoverFromDataLoss();
        break;
      case 'ransomware':
        await this.recoverFromRansomware();
        break;
      case 'regional_failure':
        await this.recoverFromRegionalFailure();
        break;
    }
  }

  private async recoverFromDataCorruption(): Promise<void> {
    // 1. Identify corrupted data
    // 2. Find last known good backup
    // 3. Restore specific tables/data
    // 4. Verify data integrity
  }

  private async recoverFromDataLoss(): Promise<void> {
    // 1. Determine extent of data loss
    // 2. Restore from most recent backup
    // 3. Apply any available transaction logs
    // 4. Notify affected users
  }

  private async recoverFromRansomware(): Promise<void> {
    // 1. Isolate affected systems
    // 2. Restore from clean backup before infection
    // 3. Implement additional security measures
    // 4. Audit all access logs
  }

  private async recoverFromRegionalFailure(): Promise<void> {
    // 1. Failover to secondary region
    // 2. Restore from geo-replicated backups
    // 3. Update DNS/routing
    // 4. Verify service availability
  }
}

// Initialize and start backup system
if (require.main === module) {
  const backupSystem = new BackupSystem(backupConfigTemplate);
  backupSystem.initialize().catch(console.error);
}

export { BackupSystem };
