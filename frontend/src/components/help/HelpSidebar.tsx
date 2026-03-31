import { Calendar, Users, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuideSectionMetadata } from '@/types/guide';

const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  Settings,
};

interface HelpSidebarProps {
  sections: GuideSectionMetadata[];
  activeSectionId: string;
  onSectionSelect: (id: string) => void;
  className?: string;
}

export function HelpSidebar({
  sections,
  activeSectionId,
  onSectionSelect,
  className,
}: HelpSidebarProps) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Secciones
      </p>
      {sections.map((section) => {
        const Icon = iconMap[section.icon] ?? Settings;
        const isActive = section.id === activeSectionId;

        return (
          <button
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={cn(
              'flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none">
                {section.title}
              </p>
              <p
                className={cn(
                  'mt-1 text-xs leading-tight',
                  isActive
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {section.description}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
