import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Types
interface Story {
  id: string;
  title: string;
  content: string;
  storyteller_id: string;
  storyteller_name: string;
  audio_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  access_level: 'public' | 'premium' | 'organizational';
  professional_themes: string[];
  cultural_protocols_required: boolean;
  sync_status: 'synced' | 'pending_upload' | 'pending_download' | 'conflict';
}

interface ReadingProgress {
  story_id: string;
  user_id: string;
  scroll_percentage: number;
  time_spent_seconds: number;
  last_position: number;
  completed: boolean;
  last_read_at: string;
  highlights: string[];
}

interface CulturalProtocol {
  id: string;
  protocol_type: string;
  description: string;
  acceptance_required: boolean;
  accepted_at?: string;
  storyteller_cultural_level?: string;
}

interface OfflineEngagement {
  id: string;
  story_id: string;
  engagement_type: string;
  data: any;
  timestamp: string;
  synced: boolean;
}

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Open/create the database
    db = await SQLite.openDatabaseAsync('empathy_ledger.db');
    
    console.log('Database opened successfully');
    
    // Create tables
    await createTables();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Stories table for offline caching
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      storyteller_id TEXT NOT NULL,
      storyteller_name TEXT NOT NULL,
      audio_url TEXT,
      video_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      access_level TEXT NOT NULL,
      professional_themes TEXT, -- JSON string
      cultural_protocols_required BOOLEAN DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      cached_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reading progress tracking
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reading_progress (
      story_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      scroll_percentage REAL DEFAULT 0,
      time_spent_seconds INTEGER DEFAULT 0,
      last_position REAL DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      last_read_at TEXT DEFAULT CURRENT_TIMESTAMP,
      highlights TEXT, -- JSON string
      PRIMARY KEY (story_id, user_id)
    );
  `);

  // Cultural protocols
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cultural_protocols (
      id TEXT PRIMARY KEY,
      protocol_type TEXT NOT NULL,
      description TEXT NOT NULL,
      acceptance_required BOOLEAN DEFAULT 1,
      accepted_at TEXT,
      storyteller_cultural_level TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Offline engagement tracking
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_engagements (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL,
      engagement_type TEXT NOT NULL,
      data TEXT, -- JSON string
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      synced BOOLEAN DEFAULT 0
    );
  `);

  // App settings
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Collaboration data cache
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS collaborations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'mentorship', 'referral', 'collective_project'
      participants TEXT, -- JSON string
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT,
      cached_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('All tables created successfully');
};

// Story operations
export const cacheStory = async (story: Story): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    `INSERT OR REPLACE INTO stories 
     (id, title, content, storyteller_id, storyteller_name, audio_url, video_url, 
      created_at, updated_at, access_level, professional_themes, cultural_protocols_required, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      story.id,
      story.title,
      story.content,
      story.storyteller_id,
      story.storyteller_name,
      story.audio_url || null,
      story.video_url || null,
      story.created_at,
      story.updated_at,
      story.access_level,
      JSON.stringify(story.professional_themes),
      story.cultural_protocols_required ? 1 : 0,
      story.sync_status
    ]
  );
};

export const getCachedStories = async (): Promise<Story[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync('SELECT * FROM stories ORDER BY updated_at DESC');
  
  return rows.map((row: any) => ({
    ...row,
    professional_themes: JSON.parse(row.professional_themes || '[]'),
    cultural_protocols_required: Boolean(row.cultural_protocols_required)
  }));
};

export const getCachedStory = async (storyId: string): Promise<Story | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync('SELECT * FROM stories WHERE id = ?', [storyId]);
  
  if (!row) return null;
  
  return {
    ...(row as any),
    professional_themes: JSON.parse((row as any).professional_themes || '[]'),
    cultural_protocols_required: Boolean((row as any).cultural_protocols_required)
  };
};

// Reading progress operations
export const saveStoryProgress = async (progress: ReadingProgress): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    `INSERT OR REPLACE INTO reading_progress 
     (story_id, user_id, scroll_percentage, time_spent_seconds, last_position, 
      completed, last_read_at, highlights)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      progress.story_id,
      progress.user_id || 'default_user',
      progress.scroll_percentage,
      progress.time_spent_seconds,
      progress.last_position,
      progress.completed ? 1 : 0,
      progress.last_read_at,
      JSON.stringify(progress.highlights || [])
    ]
  );
};

export const getStoryProgress = async (storyId: string, userId: string = 'default_user'): Promise<ReadingProgress | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync(
    'SELECT * FROM reading_progress WHERE story_id = ? AND user_id = ?',
    [storyId, userId]
  );
  
  if (!row) return null;
  
  return {
    ...(row as any),
    completed: Boolean((row as any).completed),
    highlights: JSON.parse((row as any).highlights || '[]')
  };
};

// Cultural protocols operations
export const saveCulturalProtocol = async (protocol: CulturalProtocol): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    `INSERT OR REPLACE INTO cultural_protocols 
     (id, protocol_type, description, acceptance_required, accepted_at, storyteller_cultural_level)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      protocol.id,
      protocol.protocol_type,
      protocol.description,
      protocol.acceptance_required ? 1 : 0,
      protocol.accepted_at || null,
      protocol.storyteller_cultural_level || null
    ]
  );
};

export const getCulturalProtocols = async (): Promise<CulturalProtocol[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync('SELECT * FROM cultural_protocols');
  
  return rows.map((row: any) => ({
    ...row,
    acceptance_required: Boolean(row.acceptance_required)
  }));
};

// Offline engagement tracking
export const trackOfflineEngagement = async (engagement: OfflineEngagement): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    `INSERT INTO offline_engagements (id, story_id, engagement_type, data, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      engagement.id,
      engagement.story_id,
      engagement.engagement_type,
      JSON.stringify(engagement.data),
      engagement.timestamp,
      engagement.synced ? 1 : 0
    ]
  );
};

export const getUnsyncedEngagements = async (): Promise<OfflineEngagement[]> => {
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync('SELECT * FROM offline_engagements WHERE synced = 0');
  
  return rows.map((row: any) => ({
    ...row,
    data: JSON.parse(row.data || '{}'),
    synced: Boolean(row.synced)
  }));
};

export const markEngagementSynced = async (engagementId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'UPDATE offline_engagements SET synced = 1 WHERE id = ?',
    [engagementId]
  );
};

// App settings
export const saveSetting = async (key: string, value: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};

export const getSetting = async (key: string): Promise<string | null> => {
  if (!db) throw new Error('Database not initialized');

  const row = await db.getFirstAsync(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  
  return row ? (row as any).value : null;
};

// Database cleanup and maintenance
export const clearCache = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  await db.execAsync('DELETE FROM stories');
  await db.execAsync('DELETE FROM collaborations');
  console.log('Cache cleared successfully');
};

export const getDatabaseInfo = async (): Promise<any> => {
  if (!db) throw new Error('Database not initialized');

  const storyCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM stories');
  const progressCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM reading_progress');
  const protocolCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM cultural_protocols');
  const engagementCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM offline_engagements WHERE synced = 0');
  
  return {
    cachedStories: (storyCount as any)?.count || 0,
    readingProgress: (progressCount as any)?.count || 0,
    culturalProtocols: (protocolCount as any)?.count || 0,
    unsyncedEngagements: (engagementCount as any)?.count || 0
  };
};
