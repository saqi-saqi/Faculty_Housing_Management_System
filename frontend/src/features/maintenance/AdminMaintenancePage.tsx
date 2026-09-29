import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Edit3, X } from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { DataTable, Column } from '../../components/shared/DataTable.js';
import { StatusPill } from '../../components/shared/StatusPill.js';
import { formatDate } from '../../lib/utils.js';
import { MaintenanceRequest } from '../../types/index.js';

const statusFormSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'cancelled']),
  adminNotes: z.string().optional()
});

type StatusFormValues = z.infer<typeof statusFormSchema>;

export function AdminMaintenancePage() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data: requests = [], isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['admin', 'maintenance', statusFilter, priorityFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const res = await api.get('/maintenance/admin/all', { params });
      return res.data.data;
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema)
  });

  const updateMutation = useMutation({
    mutationFn: async (data: StatusFormValues) => {
      if (!selectedRequest) return;
      await api.patch(`/maintenance/admin/${selectedRequest.id}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance'] });
      toast.success('Work order status updated successfully.');
      setSelectedRequest(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update ticket status.');
    }
  });

  const openStatusModal = (req: MaintenanceRequest) => {
    setSelectedRequest(req);
    reset({
      status: req.status,
      adminNotes: req.admin_notes || ''
    });
  };

  const columns: Column<MaintenanceRequest>[] = [
    {
      key: 'id',
      header: 'Ticket #',
      sortable: true,
      render: (r) => <span className="font-mono text-xs font-semibold text-primary">#{r.id}</span>
    },
    {
      key: 'house_number',
      header: 'Quarters',
      sortable: true,
      render: (r) => <span className="font-semibold text-foreground">{r.house_number}</span>
    },
    {
      key: 'problem',
      header: 'Issue / Problem',
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-semibold text-foreground text-xs">{r.problem}</div>
          <div className="text-[11px] text-muted-foreground truncate max-w-xs">{r.description}</div>
        </div>
      )
    },
    {
      key: 'faculty_name',
      header: 'Resident',
      sortable: true,
      render: (r) => (
        <div>
          <div className="text-xs font-medium text-foreground">{r.faculty_name || 'Resident'}</div>
          <div className="text-[10px] text-muted-foreground">{r.user_email}</div>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${r.priority === 'emergency' ? 'bg-destructive/15 text-destructive' : r.priority === 'high' ? 'bg-rose-500/15 text-rose-600' : 'bg-muted text-muted-foreground'}`}>
          {r.priority}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusPill status={r.status} type="maintenance" />
    },
    {
      key: 'created_at',
      header: 'Reported',
      sortable: true,
      render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
    },
    {
      key: 'actions',
      header: 'Action',
      render: (r) => (
        <button
          onClick={() => openStatusModal(r)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Update
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Maintenance Operations"
        description="Master work order dashboard for triage, status updates, and dispatch notes."
      />

      <DataTable
        data={requests}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search tickets by problem, quarters, or resident..."
        searchKeys={['problem', 'house_number', 'faculty_name', 'description']}
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        }
        emptyTitle="No maintenance tickets found"
        emptyDescription="There are no tickets matching your filter criteria."
      />

      {/* Update Status Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-card p-6 md:p-8 shadow-xl border border-border">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
              <Wrench className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Update Ticket #{selectedRequest.id}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedRequest.problem} • Quarters {selectedRequest.house_number}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Resolution State
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending Triage</option>
                  <option value="in_progress">In Progress / Dispatched</option>
                  <option value="resolved">Resolved / Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Estate Office Note / Technician Action
                </label>
                <textarea
                  {...register('adminNotes')}
                  rows={4}
                  placeholder="e.g. Electrician scheduled for inspection. Replaced faulty wiring conduit."
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting || updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
