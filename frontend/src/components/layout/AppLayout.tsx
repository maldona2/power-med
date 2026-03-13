import { Outlet } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardShell } from './DashboardShell';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';

const SIDEBAR_ITEMS = [
  { to: '/app/appointments', label: 'Turnos', icon: Calendar },
  { to: '/app/patients', label: 'Pacientes', icon: Users },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();
  useAppointmentNotifications();

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
