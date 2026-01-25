import { useState, useMemo } from 'react';
import { Search, ChevronDown, Music2 } from 'lucide-react';
import { Button } from '@hudak/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui';
import { Input } from '@hudak/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hudak/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@hudak/ui';
import { ScrollArea } from '@hudak/ui';
import {
  INSTRUMENT_CATEGORIES,
  type Tuning,
  type InstrumentCategory,
  searchTunings,
} from '../data/tunings';

interface TuningSelectorProps {
  currentTuning: Tuning;
  onTuningSelect: (tuning: Tuning) => void;
  onCustomTuningClick: () => void;
}

export function TuningSelector({
  currentTuning,
  onTuningSelect,
  onCustomTuningClick,
}: TuningSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchTunings(searchQuery);
  }, [searchQuery]);

  // Get display text for current tuning
  const currentTuningDisplay = useMemo(() => {
    const noteNames = [...currentTuning.notes]
      .sort((a, b) => b.string - a.string)
      .map((n) => n.name)
      .join(' ');
    return `${currentTuning.name} (${noteNames})`;
  }, [currentTuning]);

  const handleTuningSelect = (tuning: Tuning) => {
    onTuningSelect(tuning);
    setSearchQuery('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music2 className="h-5 w-5" />
          Select Tuning
        </CardTitle>
        <CardDescription>
          Choose a preset tuning or create your own
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tuning Display */}
        <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
          <div className="text-sm text-muted-foreground">Current Tuning</div>
          <div className="font-medium">{currentTuningDisplay}</div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tunings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Found {searchResults.length} tuning(s)
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {searchResults.map(({ tuning, category }) => (
                  <Button
                    key={tuning.id}
                    variant={currentTuning.id === tuning.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-auto py-2"
                    onClick={() => handleTuningSelect(tuning)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{tuning.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.name} - {tuning.notes.map((n) => n.name).join(' ')}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No tunings found for "{searchQuery}"
          </div>
        )}

        {/* Category Browser (only show when not searching) */}
        {!searchQuery && (
          <>
            {/* Quick Category Select */}
            <Select
              value={selectedCategory || ''}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select instrument..." />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name} ({cat.tunings.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tunings for Selected Category */}
            {selectedCategory && (
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {INSTRUMENT_CATEGORIES.find((c) => c.id === selectedCategory)?.tunings.map(
                    (tuning) => (
                      <Button
                        key={tuning.id}
                        variant={currentTuning.id === tuning.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-auto py-2"
                        onClick={() => handleTuningSelect(tuning)}
                      >
                        <div className="text-left w-full">
                          <div className="font-medium">{tuning.name}</div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>
                              {[...tuning.notes]
                                .sort((a, b) => b.string - a.string)
                                .map((n) => n.name)
                                .join(' ')}
                            </span>
                            <span>{tuning.notes.length} strings</span>
                          </div>
                          {tuning.description && (
                            <div className="text-xs text-muted-foreground/70 mt-0.5">
                              {tuning.description}
                            </div>
                          )}
                        </div>
                      </Button>
                    )
                  )}
                </div>
              </ScrollArea>
            )}

            {/* All Categories Accordion (alternative view) */}
            {!selectedCategory && (
              <Accordion type="single" collapsible className="w-full">
                {INSTRUMENT_CATEGORIES.slice(0, 8).map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-sm">
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                        <span className="text-muted-foreground">
                          ({category.tunings.length})
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-6">
                        {category.tunings.slice(0, 5).map((tuning) => (
                          <Button
                            key={tuning.id}
                            variant={
                              currentTuning.id === tuning.id ? 'secondary' : 'ghost'
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleTuningSelect(tuning)}
                          >
                            {tuning.name}
                          </Button>
                        ))}
                        {category.tunings.length > 5 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="w-full justify-start text-muted-foreground"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            +{category.tunings.length - 5} more...
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {INSTRUMENT_CATEGORIES.length > 8 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    Use the dropdown above to see all{' '}
                    {INSTRUMENT_CATEGORIES.length} instruments
                  </div>
                )}
              </Accordion>
            )}
          </>
        )}

        {/* Custom Tuning Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onCustomTuningClick}
        >
          Create Custom Tuning
        </Button>
      </CardContent>
    </Card>
  );
}
