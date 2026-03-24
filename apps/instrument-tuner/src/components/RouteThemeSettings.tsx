import { useState } from 'react';
import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@hudak/ui';
import { useTheme } from '../hooks/use-theme';

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System', icon: Monitor },
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
];

export function RouteThemeSettings() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="tuner-note-surface inline-flex h-10 w-10 items-center justify-center rounded-md border hover:bg-background/90"
        aria-label={open ? 'Hide settings' : 'Show settings'}
      >
        <span className="sr-only">
          {open ? 'Hide settings' : 'Show settings'}
        </span>
          <Settings className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="tuner-card-surface w-56 border p-3"
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Theme</h2>
            <p className="text-xs text-muted-foreground">
              Match the route chrome to your preference.
            </p>
          </div>
          <div className="grid gap-1.5">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? 'default' : 'outline'}
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
