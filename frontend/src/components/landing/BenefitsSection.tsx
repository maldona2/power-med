import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Users,
  BarChart3,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const benefits = [
  {
    icon: Calendar,
    title: 'Un calendario para toda la clínica',
    description:
      'Visualiza la disponibilidad de todos tus proveedores y salas en tiempo real. Evita conflictos y optimiza cada hora.',
    bullets: [
      'Vista unificada multi-proveedor',
      'Gestión de salas y equipos',
      'Recordatorios automáticos',
    ],
  },
  {
    icon: Users,
    title: 'Cada detalle del paciente en un lugar',
    description:
      'Perfiles completos con historial, fotos antes/después, consentimientos y planes de tratamiento.',
    bullets: [
      'Fotos antes/después organizadas',
      'Formularios de consentimiento digitales',
      'Notas y etiquetas personalizadas',
    ],
  },
  {
    icon: BarChart3,
    title: 'Visibilidad clara para dueños',
    description:
      'Dashboard con métricas clave: ocupación, ingresos, no-shows. Toma decisiones basadas en datos.',
    bullets: [
      'Métricas de rendimiento en tiempo real',
      'Reportes exportables',
      'Alertas y notificaciones',
    ],
  },
  {
    icon: Sparkles,
    title: 'Diseñado para flujos estéticos',
    description:
      'No es un software genérico. Cada función está pensada para cómo trabajan las clínicas de estética.',
    bullets: [
      'Planes de tratamiento estructurados',
      'Seguimiento de resultados',
      'Integración con tu flujo actual',
    ],
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Por qué elegir Atriax
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Construido específicamente para las necesidades de medicina
            estética.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((item, i) => (
            <Card key={i} className="bg-card border-border overflow-hidden">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <ul className="space-y-2">
                  {item.bullets.map((bullet, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
