import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

interface TuningBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function TuningBreadcrumbs({ items }: TuningBreadcrumbsProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <nav className="flex min-w-max items-center gap-1 rounded-lg border bg-background/80 px-2 py-1.5" aria-label="Breadcrumb">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={`${item.label}-${idx}`} className="flex items-center gap-1">
              {item.to && !isLast ? (
                <Link
                  to={item.to as never}
                  params={item.params as never}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`px-3 py-2 text-sm font-medium ${isLast ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
