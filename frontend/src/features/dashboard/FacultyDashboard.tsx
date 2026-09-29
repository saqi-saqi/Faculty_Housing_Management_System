import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Home,
  Wrench,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../lib/store.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { StatusPill } from '../../components/shared/StatusPill.js';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { formatDate } from '../../lib/utils.js';
import { Application, MaintenanceRequest, Tenancy } from '../../types/index.js';

export function FacultyDashboard() {
  const { user, faculty } = useAuthStore();
  const isResident = !!user?.hasHouse;

  // If resident: fetch my active tenancy and my maintenance tickets
  const { data: myTenancies = [] } = useQuery<Tenancy[]>({
    queryKey: ['portal', 'my-house'],
    queryFn: async () => {
      const res = await api.get('/houses');
      // Find my allocated house
      const myHouse = res.data.data.find(
        (h: any) => h.current_tenant?.faculty_id === faculty?.id
      );
      return myHouse ? [myHouse] : [];
    },
    enabled: isResident
  });

  const { data: myRequests = [], isLoading: requestsLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['portal', 'my-maintenance'],
    queryFn: async () => {
      const res = await api.get('/maintenance/my');
      return res.data.data;
    },
    enabled: isResident
  });

  // If applicant: fetch my applications
  const { data: myApplications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ['portal', 'my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/my');
      return res.data.data;
    },
    enabled: !isResident
  });

  const activeApp = myApplications.find((a) => a.status === 'pending');
  const myHouseInfo = myTenancies[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${faculty?.name || user?.email}`}
        description="Faculty Housing & Residential Services Portal."
      />

      {/* Hero Status Card */}
      {isResident ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-card to-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Housing Tenancy
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Quarters {myHouseInfo?.house_number || 'Assigned'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                {myHouseInfo?.house_address || 'Faculty Residential Enclave'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/portal/maintenance/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Submit Repair Ticket
              </Link>
              <Link
                to="/portal/my-house"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                {activeApp ? 'Application In Review' : 'No Active Housing Allocation'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {activeApp ? `Applied for Quarters ${activeApp.house_number || ''}` : 'Ready to Apply for Housing?'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                {activeApp
                  ? 'Your application is registered in the official Seniority Queue. Allocations are processed periodically based on academic rank and service tenure.'
                  : 'Browse available campus residential units and submit an allocation application.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/portal/vacancies"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
              >
                <Building className="w-4 h-4" />
                Browse Vacant Houses
              </Link>
              {activeApp && (
                <Link
                  to="/portal/applications"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Track Application
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Profile & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Official Faculty Record</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Department
              </span>
              <span className="text-foreground font-medium text-sm">
                {faculty?.department || 'University Faculty'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Academic Grade / Seniority Rank
              </span>
              <span className="text-foreground font-medium text-sm">
                {faculty?.grade_name || 'Academic Faculty'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Service Join Date
              </span>
              <span className="text-foreground font-medium text-sm">
                {formatDate(faculty?.joined_since)}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Registered Contact
              </span>
              <span className="text-foreground font-medium text-sm">
                {faculty?.contact || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Activity: Maintenance for Residents OR Applications for Applicants */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {isResident ? 'Recent Maintenance Requests' : 'Your Housing Applications'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isResident
                  ? 'Track repairs and maintenance in your quarters'
                  : 'Current status and queue ranking'}
              </p>
            </div>
            {isResident ? (
              <Link to="/portal/maintenance" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link to="/portal/applications" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                View Tracker <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {isResident ? (
            requestsLoading ? (
              <TableSkeleton rows={3} cols={3} />
            ) : myRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Wrench className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                No maintenance tickets filed yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {myRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{req.problem}</span>
                        <StatusPill status={req.status} type="maintenance" />
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5 truncate max-w-md">
                        {req.description}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      {formatDate(req.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            appsLoading ? (
              <TableSkeleton rows={2} cols={3} />
            ) : myApplications.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Building className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                You haven't submitted any housing applications yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {myApplications.map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          Application for {app.house_number || 'Quarters'}
                        </span>
                        <StatusPill status={app.status} type="application" />
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Applied on {formatDate(app.applied_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
