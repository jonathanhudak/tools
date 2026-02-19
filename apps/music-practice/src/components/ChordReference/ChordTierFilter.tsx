/**
 * ChordTierFilter - Advanced tier filtering with visual counts and mobile support
 * Supports dynamic tier visibility toggling and displays chord counts per tier
 */

import { useState, useMemo } from 'react';
import type { Chord } from '@/lib/chord-library';
import { CHORD_LIBRARY } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'jazz';

interface TierConfig {
  difficulty: Difficulty;
  label: string;
  color: string;
  icon: string;
  description: string;
}

const TIER_CONFIG: Record<Difficulty, TierConfig> = {
  beginner: {
    difficulty: 'beginner',
    label: 'Beginner',
    color: 'bg-[var(--success-bg)] border-[var(--success-color)] text-[var(--success-color)]',
    icon: '🌱',
    description: 'Essential chords to start',
  },
  intermediate: {
    difficulty: 'intermediate',
    label: 'Intermediate',
    color: 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--accent-color)]',
    icon: '🎵',
    description: 'Expand your vocabulary',
  },
  advanced: {
    difficulty: 'advanced',
    label: 'Advanced',
    color: 'bg-secondary border-muted-foreground text-muted-foreground',
    icon: '🚀',
    description: 'Master complex voicings',
  },
  jazz: {
    difficulty: 'jazz',
    label: 'Jazz',
    color: 'bg-[var(--accent-light)] border-[var(--warning-color)] text-[var(--warning-color)]',
    icon: '🎷',
    description: 'Jazz harmony essentials',
  },
};

interface ChordTierFilterProps {
  selectedTiers: Set<Difficulty>;
  onTierToggle: (tier: Difficulty) => void;
  showCounts?: boolean;
  compact?: boolean;
}

export function ChordTierFilter({
  selectedTiers,
  onTierToggle,
  showCounts = true,
  compact = false,
}: ChordTierFilterProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Calculate counts for each tier
  const tierCounts = useMemo(() => {
    const counts: Record<Difficulty, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      jazz: 0,
    };

    CHORD_LIBRARY.forEach(chord => {
      counts[chord.difficulty]++;
    });

    return counts;
  }, []);

  const totalChords = useMemo(
    () => Array.from(selectedTiers).reduce((sum, tier) => sum + tierCounts[tier], 0),
    [selectedTiers, tierCounts]
  );

  const allTiers: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'jazz'];

  if (compact) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Tiers
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {allTiers.map(tier => {
                const config = TIER_CONFIG[tier];
                const count = tierCounts[tier];
                const isSelected = selectedTiers.has(tier);

                return (
                  <motion.button
                    key={tier}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTierToggle(tier)}
                    className={`w-full p-2 rounded-lg border-2 transition-all text-left text-xs ${
                      isSelected ? `${config.color} border-current` : 'border-border opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{config.icon} {config.label}</span>
                      {showCounts && <span className="text-xs opacity-75">{count}</span>}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop expanded view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Tier Filter
        </CardTitle>
        <CardDescription>
          {totalChords} chord{totalChords !== 1 ? 's' : ''} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {allTiers.map(tier => {
          const config = TIER_CONFIG[tier];
          const count = tierCounts[tier];
          const isSelected = selectedTiers.has(tier);

          return (
            <motion.button
              key={tier}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTierToggle(tier)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `${config.color} border-current shadow-md`
                  : 'border-border opacity-50 hover:opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  {config.label}
                </span>
                {showCounts && (
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                )}
              </div>
              <p className="text-xs opacity-75">{config.description}</p>
            </motion.button>
          );
        })}

        {/* Quick select buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              allTiers.forEach(tier => {
                if (!selectedTiers.has(tier)) {
                  onTierToggle(tier);
                }
              });
            }}
            className="text-xs"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              selectedTiers.forEach(tier => {
                onTierToggle(tier);
              });
            }}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
