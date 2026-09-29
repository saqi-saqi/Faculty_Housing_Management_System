import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store.js';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout.js';
import { FacultyLayout } from '../components/layout/FacultyLayout.js';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage.js';
import { RegisterPage } from '../features/auth/RegisterPage.js';

// Admin Pages
import { AdminDashboard } from '../features/dashboard/AdminDashboard.js';
import { AllocationsPage } from '../features/allocations/AllocationsPage.js';
import { AdminHousesPage } from '../features/houses/AdminHousesPage.js';
import { AdminMaintenancePage } from '../features/maintenance/AdminMaintenancePage.js';
import { AuditLogsPage } from '../features/audit/AuditLogsPage.js';

// Faculty Pages
import { FacultyDashboard } from '../features/dashboard/FacultyDashboard.js';
import { VacantHousesPage } from '../features/houses/VacantHousesPage.js';
import { ApplyHousePage } from '../features/applications/ApplyHousePage.js';
import { MyApplicationsPage } from '../features/applications/MyApplicationsPage.js';
import { ResidentMaintenancePage } from '../features/maintenance/ResidentMaintenancePage.js';
import { NewMaintenanceRequestPage } from '../features/maintenance/NewMaintenanceRequestPage.js';
import { MyQuartersPage } from '../features/houses/MyQuartersPage.js';

// Route Guards
function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'faculty' }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'} replace />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'} replace />;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-black text-primary">404</h1>
      <h2 className="text-xl font-bold text-foreground mt-2">Page Not Found</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        The requested screen does not exist or has been relocated.
      </p>
      <RootRedirect />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  // Admin Portal
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'allocations',
        element: <AllocationsPage />
      },
      {
        path: 'houses',
        element: <AdminHousesPage />
      },
      {
        path: 'maintenance',
        element: <AdminMaintenancePage />
      },
      {
        path: 'audit',
        element: <AuditLogsPage />
      }
    ]
  },
  // Faculty Portal
  {
    path: '/portal',
    element: (
      <ProtectedRoute role="faculty">
        <FacultyLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/portal/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <FacultyDashboard />
      },
      {
        path: 'vacancies',
        element: <VacantHousesPage />
      },
      {
        path: 'apply/:houseId',
        element: <ApplyHousePage />
      },
      {
        path: 'applications',
        element: <MyApplicationsPage />
      },
      {
        path: 'my-house',
        element: <MyQuartersPage />
      },
      {
        path: 'maintenance',
        element: <ResidentMaintenancePage />
      },
      {
        path: 'maintenance/new',
        element: <NewMaintenanceRequestPage />
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
