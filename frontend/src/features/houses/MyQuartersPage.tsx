import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Home, Users, Wrench, ShieldCheck, Calendar, Phone, ArrowRight } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../lib/store.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { formatDate } from '../../lib/utils.js';
import { House } from '../../types/index.js';

export function MyQuartersPage() {
  const { faculty } = useAuthStore();

  const { data: myHouse, isLoading } = useQuery<House | null>({
    queryKey: ['portal', 'my-house-details'],
    queryFn: async () => {
      const res = await api.get('/houses');
      const found = res.data.data.find(
        (h: any) => h.current_tenant?.faculty_id === faculty?.id
      );
      return found || null;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Residential Quarters" />
        <CardSkeleton />
      </div>
    );
  }

  if (!myHouse) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Residential Quarters" />
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground space-y-3">
          <Home className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Housing Allocated</h3>
          <p className="max-w-sm mx-auto">
            You do not currently hold an active housing tenancy. Please browse vacant campus quarters to submit an allocation request.
          </p>
          <Link
            to="/portal/vacancies"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs mt-2"
          >
            Browse Vacancies
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Quarters ${myHouse.house_number}`}
        description="Assigned official faculty residential quarters and tenancy details."
      >
        <Link
          to="/portal/maintenance/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Wrench className="w-4 h-4" />
          Report a Problem
        </Link>
      </PageHeader>

      {/* Tenancy Overview Card */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-primary tracking-wider">Assigned Residence</span>
              <h2 className="text-2xl font-bold text-foreground">{myHouse.house_number}</h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
            Active Tenancy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-muted-foreground uppercase font-semibold text-[11px] block mb-1">
              Physical Location
            </span>
            <span className="text-foreground text-sm font-medium leading-relaxed block">
              {myHouse.address}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase font-semibold text-[11px] block mb-1">
              Unit Configuration
            </span>
            <span className="text-foreground text-sm font-medium flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {myHouse.capacity} BHK Residential Unit
            </span>
          </div>

          <div>
            <span className="text-muted-foreground uppercase font-semibold text-[11px] block mb-1">
              Tenancy Effective Date
            </span>
            <span className="text-foreground text-sm font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              {formatDate(myHouse.current_tenant?.start_date)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
          {myHouse.description || 'Standard university quarters complete with separate water tank, dedicated sub-meter, and covered porch.'}
        </div>
      </div>

      {/* Guidelines & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Resident Regulations
          </div>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
            <li>Subletting or commercial use of allocated university quarters is strictly prohibited.</li>
            <li>Report structural defects, gas leaks, and roof dampness immediately to Estate Maintenance.</li>
            <li>Minor paint touch-ups are scheduled biennially during semester recesses.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Phone className="w-4 h-4 text-primary" />
            Estate Contacts
          </div>
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <span className="font-semibold text-foreground block">Estate Helpdesk (Regular Hours):</span>
              +1-555-0100 (ext. 402)
            </div>
            <div>
              <span className="font-semibold text-foreground block">Emergency Water & Power:</span>
              +1-555-0199 (24/7 Helpline)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
