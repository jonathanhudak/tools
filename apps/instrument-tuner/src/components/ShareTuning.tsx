import { useState } from 'react';
import { Share2, Copy, Check, Link2 } from 'lucide-react';
import { Button } from '@hudak/ui';
import { Input } from '@hudak/ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hudak/ui';
import { type Tuning } from '../data/tunings';
import { createShareableUrl } from '../utils/tuning-url';

interface ShareTuningProps {
  tuning: Tuning;
}

export function ShareTuning({ tuning }: ShareTuningProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = createShareableUrl(tuning);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
      const input = document.querySelector('#share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tuning.name} - Instrument Tuner`,
          text: `Check out this tuning: ${tuning.name}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error - ignore
      }
    }
  };

  const noteNames = [...tuning.notes]
    .sort((a, b) => b.string - a.string)
    .map((n) => n.name)
    .join(' ');

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
        <Share2 className="h-4 w-4" />
        Share
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Share Tuning</h4>
            <p className="text-xs text-muted-foreground">
              {tuning.name} ({noteNames})
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              id="share-url-input"
              value={shareUrl}
              readOnly
              className="text-xs h-9"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {copied && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Link copied to clipboard!
            </p>
          )}

          {/* Native share button (mobile) */}
          {typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.share && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleNativeShare}
            >
              <Link2 className="h-4 w-4" />
              Share via...
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Anyone with this link can use this tuning in their browser.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
