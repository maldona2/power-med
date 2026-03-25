import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { AgingBucket } from '@/types/debtDashboard';

interface Props {
  bucket: AgingBucket;
  onClose: () => void;
}

export function AgingReportPatientList({ bucket, onClose }: Props) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Pacientes — {bucket.range}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>{bucket.patientCount} pacientes en este rango.</p>
          <p className="mt-2 text-xs">
            Para ver el detalle de cada paciente, use el filtro de historial de
            pagos.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
