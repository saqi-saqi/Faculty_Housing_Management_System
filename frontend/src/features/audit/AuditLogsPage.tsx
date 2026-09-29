import { useQuery } from '@tanstack/react-query';
import { History, Shield } from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { DataTable, Column } from '../../components/shared/DataTable.js';
import { formatDateTime } from '../../lib/utils.js';
import { AuditLog } from '../../types/index.js';

export function AuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['admin', 'audit'],
    queryFn: async () => {
      const res = await api.get('/audit');
      return res.data.data;
    }
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      render: (log) => <span className="font-mono text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
    },
    {
      key: 'action',
      header: 'Event / Action',
      sortable: true,
      render: (log) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary font-mono">
          <Shield className="w-3 h-3" />
          {log.action}
        </span>
      )
    },
    {
      key: 'entity_type',
      header: 'Target Entity',
      sortable: true,
      render: (log) => (
        <span className="text-xs uppercase font-medium text-foreground tracking-wider">
          {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
        </span>
      )
    },
    {
      key: 'details',
      header: 'Audit Description',
      render: (log) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-md">
          {log.details || '-'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estate System Audit Trail"
        description="Immutable record of administrative allocations, status modifications, and tenancy events."
      />

      <DataTable
        data={logs}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search audit events by action or details..."
        searchKeys={['action', 'details', 'entity_type']}
        emptyTitle="No audit logs recorded"
      />
    </div>
  );
}
