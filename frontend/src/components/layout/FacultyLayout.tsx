import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Navbar } from './Navbar.js';
import { useAuthStore } from '../../lib/store.js';

export function FacultyLayout() {
  const location = useLocation();
  const { user } = useAuthStore();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    user?.hasHouse ? 'Faculty Resident' : 'Faculty Applicant',
    ...pathParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1))
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
