import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContextualHelpButtonProps {
  section: 'appointments' | 'patients' | 'profile';
  variant?: 'icon' | 'button';
  className?: string;
}

export function ContextualHelpButton({
  section,
  variant = 'icon',
  className,
}: ContextualHelpButtonProps) {
  const href = `/app/help/${section}`;

  if (variant === 'button') {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
      >
        <Link to={href}>
          <HelpCircle className="size-4" />
          Ayuda
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn('text-muted-foreground hover:text-foreground', className)}
      title="Ver guía de ayuda"
    >
      <Link to={href}>
        <HelpCircle className="size-5" />
        <span className="sr-only">Ver guía de ayuda</span>
      </Link>
    </Button>
  );
}
