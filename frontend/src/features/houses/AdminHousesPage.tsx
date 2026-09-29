import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, Plus, Users, UserX, X } from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { DataTable, Column } from '../../components/shared/DataTable.js';
import { StatusPill } from '../../components/shared/StatusPill.js';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog.js';
import { formatDate } from '../../lib/utils.js';
import { House } from '../../types/index.js';

const newHouseSchema = z.object({
  house_number: z.string().min(1, 'House number is required (e.g. H-501)'),
  address: z.string().min(3, 'Address / Sector location is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1 bedroom'),
  description: z.string().optional()
});

type NewHouseFormValues = z.infer<typeof newHouseSchema>;

export function AdminHousesPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [vacateTarget, setVacateTarget] = useState<House | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: houses = [], isLoading } = useQuery<House[]>({
    queryKey: ['admin', 'houses'],
    queryFn: async () => {
      const res = await api.get('/houses');
      return res.data.data;
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<NewHouseFormValues>({
    resolver: zodResolver(newHouseSchema),
    defaultValues: {
      house_number: '',
      address: '',
      capacity: 3,
      description: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewHouseFormValues) => {
      await api.post('/houses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'houses'] });
      toast.success('New residential house added successfully.');
      setIsAddModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to add house unit.');
    }
  });

  const vacateMutation = useMutation({
    mutationFn: async (house: House) => {
      // Find active tenancy
      const tenanciesRes = await api.get('/allocations/queue'); // or tenancy
      // Use vacate endpoint
      const tenancies = await api.get(`/houses/${house.id}`);
      const tenant = tenancies.data.data.current_tenant;
      if (!tenant) throw new Error('No active tenant found');

      // Call vacate
      await api.post('/allocations/vacate', { tenancyId: 1, notes: 'Vacated from Admin Housing Table' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'houses'] });
      toast.success('House marked as vacant.');
      setVacateTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to vacate house.');
    }
  });

  const filteredHouses = houses.filter((h) => {
    if (statusFilter === 'all') return true;
    return h.status === statusFilter;
  });

  const columns: Column<House>[] = [
    {
      key: 'house_number',
      header: 'House Unit',
      sortable: true,
      render: (h) => (
        <div className="font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          {h.house_number}
        </div>
      )
    },
    {
      key: 'address',
      header: 'Address / Enclave Location',
      sortable: true,
      render: (h) => <span className="text-muted-foreground">{h.address}</span>
    },
    {
      key: 'capacity',
      header: 'Bedrooms',
      sortable: true,
      render: (h) => (
        <span className="inline-flex items-center gap-1 font-medium text-xs">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {h.capacity} BHK
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (h) => <StatusPill status={h.status} type="house" />
    },
    {
      key: 'current_tenant',
      header: 'Current Resident',
      render: (h) => {
        if (!h.current_tenant) {
          return <span className="text-muted-foreground italic text-xs">None (Vacant)</span>;
        }
        return (
          <div>
            <div className="font-medium text-foreground text-xs">{h.current_tenant.faculty_name}</div>
            <div className="text-[11px] text-muted-foreground">Since {formatDate(h.current_tenant.start_date)}</div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (h) => {
        if (h.status === 'occupied') {
          return (
            <button
              onClick={() => setVacateTarget(h)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              title="Vacate Quarters"
            >
              <UserX className="w-3.5 h-3.5" />
              Vacate
            </button>
          );
        }
        return <span className="text-muted-foreground text-xs">-</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Residential Units"
        description="Master inventory of all faculty residential quarters, occupancy tenancies, and availability."
      >
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Housing Unit
        </button>
      </PageHeader>

      <DataTable
        data={filteredHouses}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search quarters by number or location..."
        searchKeys={['house_number', 'address']}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Under Repair</option>
          </select>
        }
        emptyTitle="No housing records found"
      />

      {/* Add New House Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 md:p-8 shadow-xl border border-border">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground">Add New Residential Unit</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Register a new campus villa or apartment unit into the housing master database.
            </p>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  House Number / Unit ID
                </label>
                <input
                  type="text"
                  {...register('house_number')}
                  placeholder="e.g. H-501 or Villa-12"
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.house_number && (
                  <p className="text-xs text-destructive mt-1">{errors.house_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Location / Campus Address
                </label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="e.g. Block E, University Heights, Sector 5"
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.address && (
                  <p className="text-xs text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Bedrooms / Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  {...register('capacity')}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.capacity && (
                  <p className="text-xs text-destructive mt-1">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description / Features (Optional)
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="e.g. Corner plot, solar geyser, dedicated carport"
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting || createMutation.isPending ? 'Saving...' : 'Create House'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Vacate Dialog */}
      <ConfirmDialog
        isOpen={!!vacateTarget}
        onClose={() => setVacateTarget(null)}
        onConfirm={() => vacateTarget && vacateMutation.mutate(vacateTarget)}
        title={`Vacate House ${vacateTarget?.house_number}?`}
        description={`This will formally conclude the current faculty tenancy for ${vacateTarget?.current_tenant?.faculty_name || 'the occupant'} and return House ${vacateTarget?.house_number} to Vacant status for the Seniority Queue.`}
        confirmText="Confirm Vacate"
        variant="danger"
        isLoading={vacateMutation.isPending}
      />
    </div>
  );
}
