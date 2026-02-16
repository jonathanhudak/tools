/**
 * ChordSearch - Search and filter chords by name, difficulty, and type
 */

import { useState, useMemo } from 'react';
import type { Chord } from '@/lib/chord-library';
import { CHORD_LIBRARY, searchChords } from '@/lib/chord-library';
import { Input } from '@hudak/ui/components/input';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hudak/ui/components/select';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChordSearchProps {
  onChordSelect: (chord: Chord) => void;
  selectedChord?: Chord;
}

type FilterDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';
type FilterType = 'all' | Chord['type'];

export function ChordSearch({ onChordSelect, selectedChord }: ChordSearchProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<FilterDifficulty>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  // Memoized filtered chords
  const filteredChords = useMemo(() => {
    let results: Chord[] = searchQuery ? searchChords(searchQuery) : CHORD_LIBRARY;

    if (difficultyFilter !== 'all') {
      results = results.filter(chord => chord.difficulty === difficultyFilter);
    }

    if (typeFilter !== 'all') {
      results = results.filter(chord => chord.type === typeFilter);
    }

    return results.sort((a, b) => {
      // Sort by difficulty level
      const diffOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
      return diffOrder[a.difficulty] - diffOrder[b.difficulty];
    });
  }, [searchQuery, difficultyFilter, typeFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search chords... (e.g., 'C major', 'Am', 'blues')"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {/* Difficulty filter */}
        <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as FilterDifficulty)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="major">Major</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
            <SelectItem value="dominant">Dominant</SelectItem>
            <SelectItem value="diminished">Diminished</SelectItem>
            <SelectItem value="augmented">Augmented</SelectItem>
            <SelectItem value="sus">Suspended</SelectItem>
            <SelectItem value="extended">Extended</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {(searchQuery || difficultyFilter !== 'all' || typeFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="col-span-2 md:col-span-1 lg:col-span-1 h-9 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results summary */}
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-semibold">{filteredChords.length}</span> chord
        {filteredChords.length !== 1 ? 's' : ''}
      </div>

      {/* Chord grid */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 max-h-96 overflow-y-auto">
        {filteredChords.map(chord => (
          <motion.button
            key={chord.id}
            onClick={() => onChordSelect(chord)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg border-2 transition-all text-left ${
              selectedChord?.id === chord.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold text-sm">{chord.shortName}</div>
            <div className="text-xs text-muted-foreground">{chord.type}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              {chord.difficulty}
            </Badge>
          </motion.button>
        ))}
      </div>

      {filteredChords.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No chords found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
