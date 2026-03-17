import { CheckCircle2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const pricingHighlights = [
  'Planes por proveedor',
  'Sin contratos a largo plazo',
  'Empieza gratis, paga cuando estés listo',
];

const pricingFaqs = [
  {
    value: 'q1',
    question: '¿Hay costos ocultos?',
    answer:
      'No. El precio que ves es el precio que pagas. Incluye todas las funcionalidades, actualizaciones y soporte técnico.',
  },
  {
    value: 'q2',
    question: '¿Puedo cambiar de plan?',
    answer:
      'Sí, puedes escalar hacia arriba o abajo en cualquier momento. Los cambios se reflejan en tu próxima factura.',
  },
  {
    value: 'q3',
    question: '¿Hay descuentos por pago anual?',
    answer:
      'Sí, ofrecemos descuentos significativos para planes anuales. Contacta con ventas para obtener una cotización personalizada.',
  },
];

export function PricingSection() {
  return (
    <section id="precios" className="py-20 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Precios simples y transparentes
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sin sorpresas. Paga solo por lo que necesitas.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {pricingHighlights.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-background rounded-xl border border-border p-6 text-left">
            <h3 className="font-semibold text-foreground mb-4">
              Preguntas frecuentes sobre precios
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {pricingFaqs.map((faq) => (
                <AccordionItem key={faq.value} value={faq.value}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
