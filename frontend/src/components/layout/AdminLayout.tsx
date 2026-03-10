import { Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardShell } from './DashboardShell';

const SIDEBAR_ITEMS = [
  { to: '/admin/tenants', label: 'Profesionales', icon: Building2 },
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <DashboardShell
      sidebarItems={SIDEBAR_ITEMS}
      onLogout={logout}
      userEmail={user?.email}
      userName={user?.fullName}
    >
      <Outlet />
    </DashboardShell>
  );
}
