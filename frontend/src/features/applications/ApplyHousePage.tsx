import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../lib/store.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { formatDate } from '../../lib/utils.js';
import { House, Application } from '../../types/index.js';

export function ApplyHousePage() {
  const { houseId } = useParams<{ houseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { faculty } = useAuthStore();
  const [agreedToRules, setAgreedToRules] = useState(false);

  const numericHouseId = parseInt(houseId || '0', 10);

  // Fetch house details
  const { data: house, isLoading: houseLoading } = useQuery<House>({
    queryKey: ['houses', numericHouseId],
    queryFn: async () => {
      const res = await api.get(`/houses/${numericHouseId}`);
      return res.data.data;
    },
    enabled: numericHouseId > 0
  });

  // Check if faculty already has pending applications
  const { data: myApplications = [] } = useQuery<Application[]>({
    queryKey: ['portal', 'my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/my');
      return res.data.data;
    }
  });

  const existingPendingApp = myApplications.find((a) => a.status === 'pending');

  const applyMutation = useMutation({
    mutationFn: async () => {
      await api.post('/applications', { houseId: numericHouseId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['houses', 'vacant'] });
      toast.success('Housing application submitted successfully!');
      navigate('/portal/applications');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to submit application.');
    }
  });

  if (houseLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Submit Housing Application" />
        <CardSkeleton />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">House Not Found</h3>
        <p className="text-sm text-muted-foreground">The requested residential unit could not be located.</p>
        <Link to="/portal/vacancies" className="text-sm text-primary font-semibold hover:underline">
          Return to Vacant Houses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        to="/portal/vacancies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Vacancies
      </Link>

      <PageHeader
        title={`Apply for Quarters ${house.house_number}`}
        description="Formal application for university residential quarters allocation based on academic seniority rules."
      />

      {existingPendingApp && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300">
          <p className="font-semibold">Active Application Already Under Review</p>
          <p className="mt-1">
            You already have a pending application for Quarters {existingPendingApp.house_number || 'in review'}. Under estate regulations, faculty members may maintain one active application in the Seniority Queue.
          </p>
        </div>
      )}

      {/* Target House Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Selected Residential Unit</span>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            {house.house_number}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            Available / Vacant
          </span>
        </div>
        <p className="text-sm text-foreground font-medium">{house.address}</p>
        <p className="text-xs text-muted-foreground">{house.description || 'Standard faculty villa unit.'}</p>
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Capacity: <span className="font-semibold text-foreground">{house.capacity} BHK</span>
        </div>
      </div>

      {/* Pre-filled Faculty Details */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Verified Faculty Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-muted-foreground uppercase tracking-wider text-[11px] font-semibold mb-1">
              Applicant Name
            </label>
            <input
              type="text"
              readOnly
              value={faculty?.name || 'Verified Faculty Member'}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
            />
          </div>

          <div>
            <label className="block text-muted-foreground uppercase tracking-wider text-[11px] font-semibold mb-1">
              University Email
            </label>
            <input
              type="text"
              readOnly
              value={faculty?.email || ''}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
            />
          </div>

          <div>
            <label className="block text-muted-foreground uppercase tracking-wider text-[11px] font-semibold mb-1">
              Academic Department
            </label>
            <input
              type="text"
              readOnly
              value={faculty?.department || ''}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
            />
          </div>

          <div>
            <label className="block text-muted-foreground uppercase tracking-wider text-[11px] font-semibold mb-1">
              Academic Seniority Grade
            </label>
            <input
              type="text"
              readOnly
              value={faculty?.grade_name || 'Academic Grade'}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
            />
          </div>

          <div>
            <label className="block text-muted-foreground uppercase tracking-wider text-[11px] font-semibold mb-1">
              Service Commencement Date
            </label>
            <input
              type="text"
              readOnly
              value={formatDate(faculty?.joined_since)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
            />
          </div>

          <div>
            <label className="block text-muted-foreground uppercase tracking-wider text-[11px] font-semibold mb-1">
              Contact Telephone
            </label>
            <input
              type="text"
              readOnly
              value={faculty?.contact || ''}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
            />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground italic">
          * Note: Your application priority in the auto-allocation engine will be calculated using your Academic Grade and Service Commencement Date.
        </p>
      </div>

      {/* Agreement & Submit */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <label className="flex items-start gap-3 cursor-pointer text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={agreedToRules}
            onChange={(e) => setAgreedToRules(e.target.checked)}
            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            I certify that the information retrieved from my university profile is accurate. I agree to adhere to the Estate Office Housing Bylaws and understand that allocations are executed strictly according to academic seniority rank and service length.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/portal/vacancies')}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreedToRules || !!existingPendingApp || applyMutation.isPending}
            onClick={() => applyMutation.mutate()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {applyMutation.isPending ? 'Submitting to Queue...' : 'Confirm & Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
