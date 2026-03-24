import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Music } from 'lucide-react';

interface TunerPageHeaderProps {
  subtitle: ReactNode;
  actions?: ReactNode;
  title?: string;
}

export function TunerPageHeader({
  subtitle,
  actions,
  title = 'Instrument Tuner',
}: TunerPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="space-y-1">
        <Link
          to="/tunings"
          className="inline-flex items-center gap-2 rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <Music className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">{title}</h1>
        </Link>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions ? <div className="ml-auto flex items-center gap-1">{actions}</div> : null}
    </div>
  );
}
