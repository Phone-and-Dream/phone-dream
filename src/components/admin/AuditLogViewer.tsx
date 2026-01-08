import { useState, useEffect } from 'react';
import { Clock, User, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  fetchAuditLogs,
  formatActionType,
  getActionColor,
  type AuditLogEntry,
  type AdminActionType,
} from '@/lib/auditLog';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await fetchAuditLogs(100);
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.action_type === filter);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionTypes: AdminActionType[] = [
    'approve_application',
    'reject_application',
    'validate_reference',
    'match_device',
    'confirm_delivery',
    'update_xp_rule',
    'adjust_xp',
    'login',
    'logout',
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Admin Audit Log</h2>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatActionType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading && logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-6 w-6 mx-auto mb-2" />
          <p>No audit logs yet</p>
          <p className="text-sm">Actions will be logged as you use the admin panel</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={getActionColor(log.action_type)}
                      >
                        {formatActionType(log.action_type)}
                      </Badge>
                      {log.entity_type && (
                        <span className="text-xs text-muted-foreground">
                          {log.entity_type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{log.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.admin_email || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(log.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {(log.old_value || log.new_value) && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    {log.old_value && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Before:</span>{' '}
                        {JSON.stringify(log.old_value)}
                      </div>
                    )}
                    {log.new_value && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">After:</span>{' '}
                        {JSON.stringify(log.new_value)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
