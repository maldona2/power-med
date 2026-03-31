import type { GuideSectionMetadata } from '@/types/guide';

export const sectionMetadata: GuideSectionMetadata[] = [
  {
    id: 'appointments',
    title: 'Turnos',
    description: 'Gestiona turnos, calendario y notas de sesión',
    icon: 'Calendar',
  },
  {
    id: 'patients',
    title: 'Pacientes',
    description: 'Administra el listado y datos de tus pacientes',
    icon: 'Users',
  },
  {
    id: 'profile',
    title: 'Perfil y configuración',
    description: 'Tratamientos, horarios y planes de suscripción',
    icon: 'Settings',
  },
];

const markdownModules: Record<string, () => Promise<{ default: string }>> = {
  appointments: () =>
    import('./appointments.md?raw') as Promise<{ default: string }>,
  patients: () => import('./patients.md?raw') as Promise<{ default: string }>,
  profile: () => import('./profile.md?raw') as Promise<{ default: string }>,
};

export async function loadSectionContent(id: string): Promise<string> {
  const loader = markdownModules[id];
  if (!loader) throw new Error(`Unknown guide section: ${id}`);
  const mod = await loader();
  return mod.default;
}
