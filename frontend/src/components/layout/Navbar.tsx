import { useState } from 'react';
import { Menu, Bell, User as UserIcon, LogOut, Shield, Home } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../lib/store.js';
import { ThemeToggle } from './ThemeToggle.js';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  breadcrumbs?: string[];
}

export function Navbar({ breadcrumbs = [] }: NavbarProps) {
  const { user, faculty, logout } = useAuthStore();
  const { toggleSidebar, setMobileMenuOpen } = useUIStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            toggleSidebar();
            setMobileMenuOpen(true);
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Collapse Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-sm font-medium text-muted-foreground">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <span className="mx-2 text-border">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right section: theme toggle, notifications, user profile */}
      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />

        {/* Notifications mock dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="text-xs text-primary font-medium">3 unread</span>
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-2 rounded-lg bg-muted/40">
                  <p className="font-semibold text-foreground">Seniority Queue Updated</p>
                  <p className="text-muted-foreground mt-0.5">Auto-allocation preview ready for estate office review.</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/40">
                  <p className="font-semibold text-foreground">Maintenance Notice</p>
                  <p className="text-muted-foreground mt-0.5">Water supply maintenance scheduled for Block B tomorrow.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {faculty?.name ? faculty.name.charAt(0) : user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-xs">
              <p className="font-semibold text-foreground leading-tight truncate max-w-[130px]">
                {faculty?.name || user?.email}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize leading-tight">
                {user?.role === 'admin' ? 'Estate Administrator' : (user?.hasHouse ? 'Resident' : 'Applicant')}
              </p>
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold text-foreground">{faculty?.name || 'User Account'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                    {user?.role === 'admin' ? <Shield className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                    {user?.role}
                  </span>
                  {user?.role === 'faculty' && (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${user?.hasHouse ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
                      {user?.hasHouse ? 'Allocated Resident' : 'Unallocated Applicant'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
