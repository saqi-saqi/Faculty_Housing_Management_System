import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, Building, CheckCircle2, Clock, XCircle, Trash2, Plus } from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { StatusPill } from '../../components/shared/StatusPill.js';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog.js';
import { EmptyState } from '../../components/shared/EmptyState.js';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { formatDate } from '../../lib/utils.js';
import { Application } from '../../types/index.js';

export function MyApplicationsPage() {
  const queryClient = useQueryClient();
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['portal', 'my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/my');
      return res.data.data;
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/applications/${id}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'my-applications'] });
      toast.success('Application withdrawn successfully.');
      setWithdrawTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to withdraw application.');
    }
  });

  const activeApp = applications.find((a) => a.status === 'pending');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Housing Application Tracking"
        description="Monitor the progress of your university quarters allocation requests in the Seniority Queue."
      >
        <Link
          to="/portal/vacancies"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Browse Vacancies
        </Link>
      </PageHeader>

      {/* Visual Lifecycle Stepper for Active Application */}
      {activeApp && (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs uppercase font-semibold text-primary tracking-wider">Active Request</span>
              <h3 className="text-lg font-bold text-foreground">
                Quarters {activeApp.house_number || 'Application'}
              </h3>
            </div>
            <StatusPill status={activeApp.status} type="application" />
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">1. Application Filed</p>
                <p className="text-muted-foreground mt-0.5">{formatDate(activeApp.applied_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold text-foreground">2. Seniority Queue Review</p>
                <p className="text-muted-foreground mt-0.5">Ranked by academic grade & service tenure</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs opacity-60">
              <Building className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">3. House Allotment</p>
                <p className="text-muted-foreground mt-0.5">Automated batch allocation or estate review</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Wish to apply for a different unit instead?
            </span>
            <button
              onClick={() => setWithdrawTarget(activeApp)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Withdraw Application
            </button>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Application History</h3>

        {isLoading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No housing applications on file"
            description="You have not submitted any applications for campus quarters yet."
            action={{
              label: 'Browse Vacant Houses',
              onClick: () => {}
            }}
          />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            {applications.map((app) => (
              <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-primary" />
                      {app.house_number || `Unit #${app.house_id}`}
                    </span>
                    <StatusPill status={app.status} type="application" />
                  </div>
                  <p className="text-xs text-muted-foreground">{app.house_address || 'Campus Faculty Enclave'}</p>
                  <p className="text-[11px] text-muted-foreground">Applied: {formatDate(app.applied_at)}</p>
                  {app.admin_notes && (
                    <div className="mt-2 text-xs bg-muted/60 p-2 rounded-lg text-foreground">
                      <span className="font-semibold">Estate Office Notes: </span>
                      {app.admin_notes}
                    </div>
                  )}
                </div>

                {app.status === 'pending' && (
                  <button
                    onClick={() => setWithdrawTarget(app)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-destructive hover:bg-destructive/10 text-xs font-medium transition-colors self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Withdraw
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Withdraw Dialog */}
      <ConfirmDialog
        isOpen={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={() => withdrawTarget && withdrawMutation.mutate(withdrawTarget.id)}
        title="Withdraw Housing Application?"
        description="Are you sure you want to withdraw this application from the Seniority Queue? You will relinquish your current queue position for this house."
        confirmText="Withdraw"
        variant="danger"
        isLoading={withdrawMutation.isPending}
      />
    </div>
  );
}
