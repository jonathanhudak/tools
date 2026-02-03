import { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Button } from '@hudak/ui/components/button';
import { toast } from 'sonner';

interface AudioUploaderProps {
  onFilesAdded: (files: File[]) => void;
  hasFiles: boolean;
  onClear: () => void;
}

const SUPPORTED_FORMATS = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];

export function AudioUploader({ onFilesAdded, hasFiles, onClear }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (SUPPORTED_FORMATS.includes(file.type) || file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Unsupported format: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
      toast.success(`Added ${validFiles.length} file(s)`);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop audio files here</p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
        <p className="text-xs text-muted-foreground">Supports: MP3, WAV, OGG, M4A</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {hasFiles && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
