import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  FileText,
  Wrench,
  History,
  Building,
  Users,
  X,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../lib/store.js';
import { cn } from '../../lib/utils.js';

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const isAdmin = user?.role === 'admin';
  const isResident = user?.role === 'faculty' && user?.hasHouse;

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Seniority & Allocations', path: '/admin/allocations', icon: Users },
    { name: 'Housing Units', path: '/admin/houses', icon: Building2 },
    { name: 'Maintenance Board', path: '/admin/maintenance', icon: Wrench },
    { name: 'System Audit Logs', path: '/admin/audit', icon: History }
  ];

  const facultyNav = isResident
    ? [
        { name: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
        { name: 'My Quarters', path: '/portal/my-house', icon: Home },
        { name: 'Maintenance Requests', path: '/portal/maintenance', icon: Wrench },
        { name: 'Browse Vacancies', path: '/portal/vacancies', icon: Building }
      ]
    : [
        { name: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
        { name: 'Browse Vacant Houses', path: '/portal/vacancies', icon: Building },
        { name: 'My Applications', path: '/portal/applications', icon: FileText }
      ];

  const navItems = isAdmin ? adminNav : facultyNav;

  const content = (
    <div className="flex h-full flex-col justify-between bg-card border-r border-border py-4">
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-md shadow-primary/20">
              F
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-base font-bold text-foreground tracking-tight block">FHMS Portal</span>
                <span className="text-[11px] text-muted-foreground block -mt-0.5">Faculty Housing System</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tenancy status badge footer */}
      {!sidebarCollapsed && (
        <div className="px-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              {isAdmin ? (
                <>
                  <Building2 className="w-4 h-4 text-primary" />
                  Estate Office View
                </>
              ) : isResident ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Housing Allocated
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-500" />
                  Applicant Status
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
              {isAdmin
                ? 'Seniority auto-allocation & repair dispatch active.'
                : isResident
                ? 'Your residential tenancy is active. Maintenance tools unlocked.'
                : 'Browse vacancies and submit housing applications.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:block transition-all duration-200 ease-in-out h-screen sticky top-0 z-40 flex-shrink-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-y-0 left-0 w-72 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
