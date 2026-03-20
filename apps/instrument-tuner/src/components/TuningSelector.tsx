import { useState, useMemo } from 'react';
import { Search, Music2, ChevronRight } from 'lucide-react';
import { Button } from '@hudak/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui';
import { Input } from '@hudak/ui';
import { ScrollArea } from '@hudak/ui';
import {
  INSTRUMENT_CATEGORIES,
  type Tuning,
  searchTunings,
  getTuningContext,
  getTuningsBySection,
} from '../data/tunings';

interface TuningSelectorProps {
  currentTuning: Tuning;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string) => void;
  onTuningSelect: (tuning: Tuning) => void;
  onCustomTuningClick: () => void;
}

export function TuningSelector({
  currentTuning,
  selectedCategoryId,
  onCategoryChange,
  onTuningSelect,
  onCustomTuningClick,
}: TuningSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const currentContext = useMemo(() => getTuningContext(currentTuning), [currentTuning]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchTunings(searchQuery);
  }, [searchQuery]);

  const selectedCategory = useMemo(
    () => INSTRUMENT_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null,
    [selectedCategoryId]
  );

  const sectionedTunings = useMemo(() => {
    if (!selectedCategory) return null;
    return getTuningsBySection(selectedCategory);
  }, [selectedCategory]);

  const handleTuningSelect = (tuning: Tuning) => {
    const ctx = getTuningContext(tuning);
    if (ctx) onCategoryChange(ctx.category.id);
    onTuningSelect(tuning);
    setSearchQuery('');
  };

  const tuningButtonClass = (tuningId: string) =>
    currentTuning.id === tuningId
      ? 'w-full justify-start h-auto py-2 border-l-2 border-primary bg-accent'
      : 'w-full justify-start h-auto py-2';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Music2 className="h-5 w-5" />
          Tuning Browser
        </CardTitle>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span>{currentContext?.category.name || 'Instrument'}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{currentContext?.section || 'Section'}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{currentTuning.name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search tunings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search tunings"
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {INSTRUMENT_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
                onClick={() => onCategoryChange(cat.id)}
                className="shrink-0"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {searchResults && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {searchResults.length
                ? `Found ${searchResults.length} tuning(s)`
                : `No tunings found for "${searchQuery}"`}
            </div>
            {searchResults.length > 0 && (
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {searchResults.map(({ tuning, category }) => {
                    const ctx = getTuningContext(tuning);
                    return (
                      <Button
                        key={tuning.id}
                        variant={currentTuning.id === tuning.id ? 'secondary' : 'ghost'}
                        className={tuningButtonClass(tuning.id)}
                        onClick={() => handleTuningSelect(tuning)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{tuning.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.name} › {ctx?.section || 'General'}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {!searchResults && sectionedTunings && (
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {Object.entries(sectionedTunings).map(([section, tunings]) => (
                <div key={section} className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section}
                  </div>
                  {tunings.map((tuning) => (
                    <Button
                      key={tuning.id}
                      variant={currentTuning.id === tuning.id ? 'secondary' : 'ghost'}
                      className={tuningButtonClass(tuning.id)}
                      onClick={() => handleTuningSelect(tuning)}
                    >
                      <div className="text-left w-full">
                        <div className="font-medium">{tuning.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {[...tuning.notes]
                            .sort((a, b) => b.string - a.string)
                            .map((n) => n.name)
                            .join(' ')}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Button variant="outline" className="w-full" onClick={onCustomTuningClick}>
          Create Custom Tuning
        </Button>
      </CardContent>
    </Card>
  );
}
