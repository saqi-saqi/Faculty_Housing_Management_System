import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Wrench, Plus, AlertCircle, Trash2, Clock, CheckCircle } from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { StatusPill } from '../../components/shared/StatusPill.js';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog.js';
import { EmptyState } from '../../components/shared/EmptyState.js';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { formatDate } from '../../lib/utils.js';
import { MaintenanceRequest } from '../../types/index.js';

export function ResidentMaintenancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [cancelTarget, setCancelTarget] = useState<MaintenanceRequest | null>(null);

  const { data: requests = [], isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['portal', 'my-maintenance'],
    queryFn: async () => {
      const res = await api.get('/maintenance/my');
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await api.post(`/maintenance/${requestId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'my-maintenance'] });
      toast.success('Maintenance ticket cancelled.');
      setCancelTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel request.');
    }
  });

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = requests.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Residential Maintenance & Repairs"
        description="Submit and track maintenance requests for your allocated campus quarters."
      >
        <Link
          to="/portal/maintenance/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New Repair Request
        </Link>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All Tickets ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'in_progress' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'resolved' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Requests Content */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="There are no repair tickets in this category."
          action={{
            label: 'Submit New Request',
            onClick: () => {}
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{req.problem}</h3>
                      <StatusPill status={req.status} type="maintenance" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quarters {req.house_number} • Ticket #{req.id} • Reported on {formatDate(req.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${req.priority === 'emergency' ? 'bg-destructive/15 text-destructive' : req.priority === 'high' ? 'bg-rose-500/15 text-rose-600' : 'bg-muted text-muted-foreground'}`}>
                    {req.priority} Priority
                  </span>

                  {req.status === 'pending' && (
                    <button
                      onClick={() => setCancelTarget(req)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Cancel Request"
                      aria-label="Cancel Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-foreground/90 bg-muted/30 p-3.5 rounded-xl leading-relaxed">
                {req.description}
              </p>

              {req.admin_notes && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-bold">Estate Office Dispatch Note: </span>
                  {req.admin_notes}
                </div>
              )}

              {req.resolved_at && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Issue marked as resolved on {formatDate(req.resolved_at)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        title="Cancel Maintenance Request?"
        description={`Are you sure you want to cancel Ticket #${cancelTarget?.id} (${cancelTarget?.problem})? This will remove it from the Estate Office work queue.`}
        confirmText="Cancel Request"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
