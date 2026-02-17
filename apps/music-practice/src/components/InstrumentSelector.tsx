/**
 * InstrumentSelector - Toggle between Guitar and Piano
 */

import { Button } from '@hudak/ui/components/button';
import { Guitar, Music } from 'lucide-react';
import { motion } from 'framer-motion';

export type Instrument = 'guitar' | 'piano';

interface InstrumentSelectorProps {
  selected: Instrument;
  onChange: (instrument: Instrument) => void;
  size?: 'sm' | 'lg' | 'default';
}

export function InstrumentSelector({
  selected,
  onChange,
  size = 'default',
}: InstrumentSelectorProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 p-1 bg-muted rounded-lg w-fit"
    >
      <Button
        variant={selected === 'guitar' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onChange('guitar')}
        className="gap-2 transition-all"
      >
        <Guitar className="w-4 h-4" />
        Guitar
      </Button>

      <Button
        variant={selected === 'piano' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onChange('piano')}
        className="gap-2 transition-all"
      >
        <Music className="w-4 h-4" />
        Piano
      </Button>
    </motion.div>
  );
}
