import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Wrench,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { StatCard } from '../../components/shared/StatCard.js';
import { StatusPill } from '../../components/shared/StatusPill.js';
import { CardSkeleton, TableSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { formatDate } from '../../lib/utils.js';
import { House, Application, MaintenanceRequest } from '../../types/index.js';

export function AdminDashboard() {
  const { data: houses = [], isLoading: housesLoading } = useQuery<House[]>({
    queryKey: ['admin', 'houses'],
    queryFn: async () => {
      const res = await api.get('/houses');
      return res.data.data;
    }
  });

  const { data: queue = [], isLoading: queueLoading } = useQuery<any[]>({
    queryKey: ['admin', 'allocations', 'queue'],
    queryFn: async () => {
      const res = await api.get('/allocations/queue');
      return res.data.data;
    }
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['admin', 'maintenance'],
    queryFn: async () => {
      const res = await api.get('/maintenance/admin/all');
      return res.data.data;
    }
  });

  const totalHouses = houses.length;
  const vacantHouses = houses.filter((h) => h.status === 'vacant').length;
  const occupiedHouses = houses.filter((h) => h.status === 'occupied').length;
  const maintenanceHouses = houses.filter((h) => h.status === 'maintenance').length;
  const occupancyRate = totalHouses > 0 ? Math.round((occupiedHouses / totalHouses) * 100) : 0;

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const inProgressRequests = requests.filter((r) => r.status === 'in_progress').length;
  const resolvedRequests = requests.filter((r) => r.status === 'resolved').length;

  const occupancyChartData = [
    { name: 'Occupied', value: occupiedHouses, color: '#3b82f6' },
    { name: 'Vacant', value: vacantHouses, color: '#10b981' },
    { name: 'Repair', value: maintenanceHouses, color: '#f59e0b' }
  ];

  const maintenanceChartData = [
    { name: 'Pending', count: pendingRequests, fill: '#f59e0b' },
    { name: 'In Progress', count: inProgressRequests, fill: '#3b82f6' },
    { name: 'Resolved', count: resolvedRequests, fill: '#10b981' }
  ];

  const isLoading = housesLoading || queueLoading || requestsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estate Management Overview"
        description="Comprehensive real-time campus housing analytics, seniority queue, and maintenance operations."
      >
        <Link
          to="/admin/allocations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          Review Allocation Queue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Campus Quarters"
              value={totalHouses}
              subtitle={`${occupiedHouses} occupied (${occupancyRate}% rate)`}
              icon={<Building2 className="w-5 h-5" />}
            />
            <StatCard
              title="Vacant Units Ready"
              value={vacantHouses}
              subtitle="Available for faculty allocation"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              trend={{ value: `${vacantHouses} units free`, positive: vacantHouses > 0 }}
            />
            <StatCard
              title="Queue Applicants"
              value={queue.length}
              subtitle="Ranked by academic seniority"
              icon={<Users className="w-5 h-5 text-indigo-500" />}
              trend={{ value: 'Seniority ordered', positive: true }}
            />
            <StatCard
              title="Open Maintenance Tickets"
              value={pendingRequests + inProgressRequests}
              subtitle={`${pendingRequests} awaiting estate triage`}
              icon={<Wrench className="w-5 h-5 text-amber-500" />}
            />
          </>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Housing Distribution */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Housing Capacity Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Occupancy breakdown across university quarters</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vacant</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Repair</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Breakdown */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Maintenance Operations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Tickets by current resolution state</p>
            </div>
            <Link to="/admin/maintenance" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View Board <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {maintenanceChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Seniority Applicants & Recent Repairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Seniority Applicants */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Seniority Queue Priority</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Next in line for automatic allocation</p>
            </div>
            <Link to="/admin/allocations" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Full Queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : queue.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No pending applications in queue.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {queue.slice(0, 4).map((candidate, idx) => (
                <div key={candidate.applicationId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center font-bold text-[11px] text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{candidate.facultyName}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {candidate.gradeName} • Joined {formatDate(candidate.joinedSince)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground">{candidate.desiredHouseNumber}</span>
                    <p className="text-[11px] text-muted-foreground">Rank Score: {candidate.gradeRank}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance Requests */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Maintenance Tickets</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest issues reported by campus residents</p>
            </div>
            <Link to="/admin/maintenance" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Manage Tickets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No maintenance requests reported.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {requests.slice(0, 4).map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{req.problem}</span>
                      <StatusPill status={req.status} type="maintenance" />
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {req.house_number} • Reported {formatDate(req.created_at)}
                    </p>
                  </div>
                  <span className="text-[11px] capitalize px-2 py-0.5 rounded font-medium bg-muted">
                    {req.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
