import { useState } from 'react';
import {
  Calendar,
  Users,
  Settings,
  CheckCircle2,
  Bell,
  ImageIcon,
  BarChart3,
} from 'lucide-react';

type FeatureTab = 'citas' | 'pacientes' | 'operaciones';

const tabs: { id: FeatureTab; label: string; icon: React.ElementType }[] = [
  { id: 'citas', label: 'Citas', icon: Calendar },
  { id: 'pacientes', label: 'Pacientes', icon: Users },
  { id: 'operaciones', label: 'Operaciones', icon: Settings },
];

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<FeatureTab>('citas');

  return (
    <section
      id="funcionalidades"
      className="py-20 bg-card border-y border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Funcionalidades completas
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Todo lo que necesitas para gestionar tu clínica de manera
            profesional.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-secondary rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-8">
          {activeTab === 'citas' && (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Gestión de citas inteligente
                </h3>
                <p className="text-muted-foreground mb-6">
                  Organiza tu agenda de forma eficiente con herramientas
                  diseñadas para clínicas con múltiples proveedores.
                </p>
                <ul className="space-y-3">
                  {[
                    'Calendario centralizado para todos los proveedores',
                    'Reserva online opcional con disponibilidad inteligente',
                    'Recordatorios automáticos por SMS y email',
                    'Gestión de salas y equipamiento',
                    'Reducción de no-shows hasta un 40%',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5 text-accent" />
                  <span className="font-medium text-foreground">
                    Vista semanal
                  </span>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${i === 2 ? 'bg-accent' : 'bg-muted-foreground/30'}`}
                      />
                      <div className="flex-1">
                        <div className="h-3 bg-secondary rounded w-3/4 mb-1" />
                        <div className="h-2 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pacientes' && (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Historiales completos de pacientes
                </h3>
                <p className="text-muted-foreground mb-6">
                  Toda la información de tus pacientes organizada y accesible al
                  instante.
                </p>
                <ul className="space-y-3">
                  {[
                    'Perfiles unificados con historial completo',
                    'Fotos antes/después con comparación fácil',
                    'Consentimientos informados digitales',
                    'Planes de tratamiento estructurados',
                    'Recordatorios de seguimiento automáticos',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-accent" />
                  <span className="font-medium text-foreground">
                    Ficha de paciente
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Antes
                  </div>
                  <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Después
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-card rounded w-full" />
                  <div className="h-3 bg-card rounded w-2/3" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operaciones' && (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Control total de operaciones
                </h3>
                <p className="text-muted-foreground mb-6">
                  Gestiona múltiples clínicas y equipos con roles y permisos
                  flexibles.
                </p>
                <ul className="space-y-3">
                  {[
                    'Soporte multi-clínica / multi-tenant',
                    'Roles configurables (admin, proveedor, staff)',
                    'Dashboard con métricas clave',
                    'Reportes exportables para finanzas',
                    'Facturación básica integrada',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <span className="font-medium text-foreground">
                    Panel de métricas
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Ocupación', value: '87%' },
                    { label: 'No-shows', value: '3%' },
                    { label: 'Citas hoy', value: '24' },
                    { label: 'Ingresos', value: '€12.4k' },
                  ].map((metric, i) => (
                    <div key={i} className="bg-card rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-foreground">
                        {metric.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
