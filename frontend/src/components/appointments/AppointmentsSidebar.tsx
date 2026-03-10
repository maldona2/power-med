import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { statusConfig } from './constants';

interface AppointmentsSidebarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onDateChange: (date: Date) => void;
}

export function AppointmentsSidebar({
  selectedDate,
  onDateSelect,
  onDateChange,
}: AppointmentsSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 overflow-hidden border-r p-4 lg:block">
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(date) => {
            onDateSelect(date ?? null);
            if (date) onDateChange(date);
          }}
          className="rounded-lg border"
        />
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Estado de turnos
            </h3>
            <div className="space-y-2">
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={cn('h-2.5 w-2.5 rounded-full', config.dotColor)}
                  />
                  <span className="text-sm">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
