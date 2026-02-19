import { Download } from 'lucide-react';
import { Button } from '@hudak/ui/components/button';
import { toast } from 'sonner';

interface ExportButtonProps {
  p5Instance: any | null;
  audioFileCount: number;
}

export function ExportButton({ p5Instance, audioFileCount }: ExportButtonProps) {
  const handleExport = () => {
    if (!p5Instance || !p5Instance.canvas) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      // Get canvas context and convert to blob
      const canvas = p5Instance.canvas as HTMLCanvasElement;
      
      // Create a download link
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to export image');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audio-visualization-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Visualization exported as PNG');
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export visualization');
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={audioFileCount === 0}
      className="w-full"
      variant="default"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Image
    </Button>
  );
}
