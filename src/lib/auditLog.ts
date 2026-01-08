import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AdminActionType = 
  | 'approve_application'
  | 'reject_application'
  | 'validate_reference'
  | 'match_device'
  | 'confirm_delivery'
  | 'update_xp_rule'
  | 'adjust_xp'
  | 'login'
  | 'logout';

export interface AuditLogEntry {
  id: string;
  action_type: AdminActionType;
  description: string;
  entity_type: string | null;
  entity_id: string | null;
  old_value: Json | null;
  new_value: Json | null;
  admin_id: string | null;
  admin_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LogActionParams {
  actionType: AdminActionType;
  description: string;
  entityType?: string;
  entityId?: string;
  oldValue?: Json;
  newValue?: Json;
}

export async function logAdminAction({
  actionType,
  description,
  entityType,
  entityId,
  oldValue,
  newValue,
}: LogActionParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // For demo mode, we still log even without authenticated user
    const adminEmail = user?.email || 'demo-admin@prototype.local';
    const adminId = user?.id || null;

    await supabase.from('admin_audit_logs').insert([{
      action_type: actionType,
      description,
      entity_type: entityType || null,
      entity_id: entityId || null,
      old_value: oldValue || null,
      new_value: newValue || null,
      admin_id: adminId,
      admin_email: adminEmail,
      user_agent: navigator.userAgent,
    }]);
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - audit logging should not break the main action
  }
}

export async function fetchAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }

  return data as AuditLogEntry[];
}

export function formatActionType(type: AdminActionType): string {
  const map: Record<AdminActionType, string> = {
    approve_application: 'Approved Application',
    reject_application: 'Rejected Application',
    validate_reference: 'Validated Reference',
    match_device: 'Matched Device',
    confirm_delivery: 'Confirmed Delivery',
    update_xp_rule: 'Updated XP Rule',
    adjust_xp: 'Adjusted XP',
    login: 'Admin Login',
    logout: 'Admin Logout',
  };
  return map[type] || type;
}

export function getActionColor(type: AdminActionType): string {
  switch (type) {
    case 'approve_application':
    case 'confirm_delivery':
      return 'text-success';
    case 'reject_application':
      return 'text-destructive';
    case 'match_device':
      return 'text-info';
    case 'validate_reference':
    case 'update_xp_rule':
    case 'adjust_xp':
      return 'text-warning';
    case 'login':
    case 'logout':
      return 'text-muted-foreground';
    default:
      return 'text-foreground';
  }
}
