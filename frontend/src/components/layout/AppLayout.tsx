import { Outlet, useLocation } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardShell } from './DashboardShell';

const SIDEBAR_ITEMS = [
  { to: '/app/appointments', label: 'Turnos', icon: Calendar },
  { to: '/app/patients', label: 'Pacientes', icon: Users },
] as const;

function getHeaderTitle(pathname: string): string {
  if (pathname.includes('appointments')) return 'Turnos';
  if (pathname.includes('patients')) return 'Pacientes';
  return 'Dashboard';
}

export function AppLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <DashboardShell
      sidebarItems={SIDEBAR_ITEMS}
      headerTitle={getHeaderTitle(pathname)}
      onLogout={logout}
      userEmail={user?.email}
      userName={user?.fullName}
    >
      <Outlet />
    </DashboardShell>
  );
}
