import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  Award,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  X,
  History,
  ShieldAlert
} from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { DataTable, Column } from '../../components/shared/DataTable.js';
import { formatDate } from '../../lib/utils.js';
import { AllocationCandidate, AllocationPreviewMatch } from '../../types/index.js';

export function AllocationsPage() {
  const queryClient = useQueryClient();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'conflicts'>('queue');

  // 1. Fetch Seniority Queue
  const { data: queue = [], isLoading: queueLoading } = useQuery<AllocationCandidate[]>({
    queryKey: ['admin', 'allocations', 'queue'],
    queryFn: async () => {
      const res = await api.get('/allocations/queue');
      return res.data.data;
    }
  });

  // 2. Fetch Conflicts
  const { data: conflicts = [], isLoading: conflictsLoading } = useQuery<any[]>({
    queryKey: ['admin', 'allocations', 'conflicts'],
    queryFn: async () => {
      const res = await api.get('/allocations/conflicts');
      return res.data.data;
    }
  });

  // 3. Fetch Preview for Auto-Allocation
  const { data: previewData, refetch: fetchPreview, isFetching: previewFetching } = useQuery<{
    matches: AllocationPreviewMatch[];
    unallocatedCandidates: AllocationCandidate[];
    vacantHousesRemaining: any[];
  }>({
    queryKey: ['admin', 'allocations', 'preview'],
    queryFn: async () => {
      const res = await api.get('/allocations/preview');
      return res.data.data;
    },
    enabled: false
  });

  // 4. Auto-Allocation Execution Mutation
  const autoAllocateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/allocations/auto');
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'allocations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'houses'] });
      toast.success(`Successfully allocated ${data.allocatedCount} house(s) by seniority!`);
      setIsPreviewModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Automatic allocation failed.');
    }
  });

  const handleOpenPreview = async () => {
    await fetchPreview();
    setIsPreviewModalOpen(true);
  };

  const queueColumns: Column<AllocationCandidate>[] = [
    {
      key: 'rank',
      header: 'Queue #',
      render: (_, idx) => (
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
          {idx + 1}
        </span>
      )
    },
    {
      key: 'facultyName',
      header: 'Faculty Member',
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-foreground text-sm">{c.facultyName}</div>
          <div className="text-xs text-muted-foreground">{c.department}</div>
        </div>
      )
    },
    {
      key: 'gradeName',
      header: 'Academic Rank / Grade',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <div>
            <div className="font-semibold text-xs text-foreground">{c.gradeName}</div>
            <div className="text-[10px] text-muted-foreground">Score: {c.gradeRank} pts</div>
          </div>
        </div>
      )
    },
    {
      key: 'joinedSince',
      header: 'Service Start Date',
      sortable: true,
      render: (c) => (
        <div>
          <div className="text-xs font-medium text-foreground">{formatDate(c.joinedSince)}</div>
          <div className="text-[10px] text-muted-foreground">Seniority Tiebreaker</div>
        </div>
      )
    },
    {
      key: 'desiredHouseNumber',
      header: 'Desired Quarters',
      sortable: true,
      render: (c) => (
        <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-primary" />
          {c.desiredHouseNumber}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housing Seniority & Allocation Engine"
        description="Automated university quarters allocation based on academic rank, service length, and atomic transactions."
      >
        <button
          onClick={handleOpenPreview}
          disabled={queue.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          Auto-Allocate Batch (Preview)
        </button>
      </PageHeader>

      {/* Tabs: Queue vs Conflict Resolution */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'queue' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-4 h-4" />
          Seniority Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'conflicts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <AlertTriangle className={`w-4 h-4 ${conflicts.length > 0 ? 'text-amber-500' : ''}`} />
          Conflict Resolution ({conflicts.length})
        </button>
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-3">
            <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Deterministic Seniority Rules:</span> Applicants are prioritized first by Academic Grade Rank (Senior Professor 70 pts &gt; Professor 60 pts &gt; Associate 50 pts &gt; Assistant 40 pts &gt; Lecturer 20 pts). Ties are strictly resolved by Service Commencement Date (earlier tenure wins).
            </div>
          </div>

          <DataTable
            data={queue}
            columns={queueColumns}
            isLoading={queueLoading}
            searchPlaceholder="Search applicants by name, department, or house..."
            searchKeys={['facultyName', 'department', 'desiredHouseNumber']}
            emptyTitle="Seniority Queue is Empty"
            emptyDescription="There are currently no pending housing applications waiting for allocation."
          />
        </div>
      ) : (
        /* Integrated Conflict Panel */
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Contending Application Conflicts:</span> Multiple faculty members have applied for the same residential unit. The automated engine highlights the leading candidate determined by academic grade score and tenure.
            </div>
          </div>

          {conflictsLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading conflicts...</div>
          ) : conflicts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">No Contention Conflicts</h4>
              <p>All active applications are for distinct units without conflicting claims.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <div key={conflict.houseId} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      <h4 className="text-base font-bold text-foreground">
                        Contested Unit: Quarters {conflict.houseNumber}
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {conflict.applicants.length} Applicants Competing
                    </span>
                  </div>

                  <div className="divide-y divide-border/60">
                    {conflict.applicants.map((cand: AllocationCandidate, idx: number) => (
                      <div key={cand.applicationId} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${idx === 0 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {idx === 0 ? '★' : `#${idx + 1}`}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                              {cand.facultyName}
                              {idx === 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                                  Seniority Winner
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground">
                              {cand.gradeName} ({cand.gradeRank} pts) • Joined {formatDate(cand.joinedSince)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-muted-foreground text-[11px] block">{cand.department}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">App #{cand.applicationId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auto-Allocation Preview & Confirmation Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card p-6 md:p-8 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Auto-Allocation Preview</h3>
                <p className="text-xs text-muted-foreground">
                  Review proposed allocations before committing the database transaction.
                </p>
              </div>
            </div>

            {previewFetching ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Calculating seniority matches and locking candidates...
              </div>
            ) : !previewData || previewData.matches.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-semibold text-foreground">No matches could be made.</p>
                <p>Either all desired houses are occupied, or candidates already hold active tenancies.</p>
              </div>
            ) : (
              <div className="space-y-4 my-6">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <span className="font-semibold">{previewData.matches.length} House(s) will be allocated atomically.</span> Once confirmed, active tenancies will be created and winning applications marked as Allocated.
                </div>

                <div className="divide-y divide-border rounded-xl border border-border bg-background overflow-hidden">
                  {previewData.matches.map((match) => (
                    <div key={match.applicationId} className="p-3.5 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                          {match.facultyName}
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-primary font-semibold">House {match.houseNumber}</span>
                        </div>
                        <div className="text-muted-foreground text-[11px] mt-0.5">
                          {match.gradeName} (Score: {match.gradeRank}) • Joined {formatDate(match.joinedSince)}
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {match.reason}
                      </span>
                    </div>
                  ))}
                </div>

                {previewData.unallocatedCandidates.length > 0 && (
                  <div className="text-[11px] text-muted-foreground">
                    * {previewData.unallocatedCandidates.length} applicant(s) will remain in queue as their desired quarters are not currently vacant.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!previewData || previewData.matches.length === 0 || autoAllocateMutation.isPending}
                onClick={() => autoAllocateMutation.mutate()}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm shadow-primary/20 flex items-center gap-2"
              >
                {autoAllocateMutation.isPending ? 'Committing Allocation...' : 'Confirm & Execute Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
