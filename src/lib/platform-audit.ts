import { createClient } from './supabase';

export type AuditAction = 
  | 'project_created'
  | 'project_updated' 
  | 'project_suspended'
  | 'project_activated'
  | 'module_enabled'
  | 'module_disabled'
  | 'user_invited'
  | 'user_removed'
  | 'user_role_changed'
  | 'platform_settings_updated'
  | 'system_maintenance'
  | 'data_export'
  | 'impersonation_started'
  | 'impersonation_ended';

export type TargetType = 'project' | 'user' | 'module' | 'system';

interface AuditLogEntry {
  action: AuditAction;
  target_type?: TargetType;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

class PlatformAuditLogger {
  private supabase = createClient();

  /**
   * Log a platform administration action
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('platform_audit_log')
        .insert({
          action: entry.action,
          target_type: entry.target_type,
          target_id: entry.target_id,
          details: entry.details || {},
          ip_address: entry.ip_address,
          user_agent: entry.user_agent
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
        // Don't throw - audit logging should not break the main flow
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  /**
   * Log project-related actions
   */
  async logProjectAction(
    action: Extract<AuditAction, 'project_created' | 'project_updated' | 'project_suspended' | 'project_activated'>,
    projectId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      target_type: 'project',
      target_id: projectId,
      details
    });
  }

  /**
   * Log module-related actions
   */
  async logModuleAction(
    action: Extract<AuditAction, 'module_enabled' | 'module_disabled'>,
    projectId: string,
    moduleKey: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      target_type: 'module',
      target_id: projectId,
      details: {
        ...details,
        module_key: moduleKey
      }
    });
  }

  /**
   * Log user management actions
   */
  async logUserAction(
    action: Extract<AuditAction, 'user_invited' | 'user_removed' | 'user_role_changed'>,
    userId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      target_type: 'user',
      target_id: userId,
      details
    });
  }

  /**
   * Log system-level actions
   */
  async logSystemAction(
    action: Extract<AuditAction, 'platform_settings_updated' | 'system_maintenance' | 'data_export'>,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      target_type: 'system',
      details
    });
  }

  /**
   * Log impersonation actions (for god mode)
   */
  async logImpersonation(
    action: Extract<AuditAction, 'impersonation_started' | 'impersonation_ended'>,
    targetUserId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      target_type: 'user',
      target_id: targetUserId,
      details
    });
  }

  /**
   * Get audit log entries with filters
   */
  async getAuditLog(options: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    target_type?: TargetType;
    target_id?: string;
    start_date?: string;
    end_date?: string;
    actor_id?: string;
  } = {}) {
    let query = this.supabase
      .from('platform_audit_log')
      .select(`
        id,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent,
        created_at,
        actor:profiles!platform_audit_log_actor_id_fkey(
          id,
          display_name,
          email,
          platform_role
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options.action) {
      query = query.eq('action', options.action);
    }
    if (options.target_type) {
      query = query.eq('target_type', options.target_type);
    }
    if (options.target_id) {
      query = query.eq('target_id', options.target_id);
    }
    if (options.actor_id) {
      query = query.eq('actor_id', options.actor_id);
    }
    if (options.start_date) {
      query = query.gte('created_at', options.start_date);
    }
    if (options.end_date) {
      query = query.lte('created_at', options.end_date);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch audit log: ${error.message}`);
    }

    return data;
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(timeframe: '24h' | '7d' | '30d' = '7d') {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    const { data, error } = await this.supabase
      .from('platform_audit_log')
      .select('action, target_type, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch audit stats: ${error.message}`);
    }

    // Process statistics
    const stats = {
      total_actions: data.length,
      actions_by_type: {} as Record<string, number>,
      actions_by_target: {} as Record<string, number>,
      daily_activity: [] as Array<{ date: string; count: number }>
    };

    data.forEach(entry => {
      // Count by action type
      stats.actions_by_type[entry.action] = (stats.actions_by_type[entry.action] || 0) + 1;
      
      // Count by target type
      if (entry.target_type) {
        stats.actions_by_target[entry.target_type] = (stats.actions_by_target[entry.target_type] || 0) + 1;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const platformAudit = new PlatformAuditLogger();

// Helper function for server-side usage
export async function logPlatformAction(
  action: AuditAction,
  target_type?: TargetType,
  target_id?: string,
  details?: Record<string, any>,
  request?: Request
): Promise<void> {
  const auditEntry: AuditLogEntry = {
    action,
    target_type,
    target_id,
    details
  };

  // Extract IP and User-Agent from request if available
  if (request) {
    auditEntry.ip_address = request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           'unknown';
    auditEntry.user_agent = request.headers.get('user-agent') || 'unknown';
  }

  await platformAudit.log(auditEntry);
}