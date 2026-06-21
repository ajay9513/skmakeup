import { useCallback, useId, useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { filterImageFiles, IMAGE_ACCEPT } from '@/lib/image-file';

interface MediaUploadZoneProps {
  folder: string;
  onUpload: (files: File[], metadata: { alt: string; caption: string }, onProgress?: (pct: number) => void) => Promise<void>;
  multiple?: boolean;
  isUploading?: boolean;
  compact?: boolean;
}

export function MediaUploadZone({ folder, onUpload, multiple = false, isUploading, compact }: MediaUploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const [progress, setProgress] = useState(0);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const accepted = filterImageFiles(incoming);
    const rejected = incoming.length - accepted.length;

    if (rejected > 0) {
      setFileError(`${rejected} file(s) skipped — use JPEG, PNG, WebP, AVIF, or GIF under 10MB.`);
    } else {
      setFileError('');
    }

    if (accepted.length === 0) return;

    const newPreviews = accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPreviews((prev) => (multiple ? [...prev, ...newPreviews] : newPreviews));

    if (inputRef.current) inputRef.current.value = '';
  }, [multiple]);

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setProgress(0);
    try {
      await onUpload(previews.map((p) => p.file), { alt, caption }, setProgress);
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
      setPreviews([]);
      setAlt('');
      setCaption('');
      setFileError('');
      setProgress(0);
    } catch {
      setFileError('Upload failed. Check your connection and Cloudinary settings.');
      setProgress(0);
    }
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index].preview);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-dashed transition',
          compact ? 'p-4' : 'p-8',
          isDragActive ? 'border-gold bg-gold/5' : 'border-charcoal-light/20 hover:border-gold/50 hover:bg-gold/5',
        )}
      >
        {/* Native overlay input — never use display:none; required for Windows file picker */}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple={multiple}
          tabIndex={-1}
          aria-label="Choose image files"
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            if (e.target.files?.length) processFiles(e.target.files);
          }}
        />

        <div className="pointer-events-none relative z-10 text-center">
          <Upload className="mx-auto h-10 w-10 text-gold/60" />
          <p className="mt-3 font-medium text-charcoal">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          {!compact && (
            <p className="mt-1 text-xs text-charcoal/50">JPEG, PNG, WebP, AVIF, GIF — max 10MB — folder: {folder}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={openPicker} className="gap-2">
          <Upload className="h-4 w-4" />
          {compact ? 'Upload Image' : 'Browse Files'}
        </Button>
      </div>

      {fileError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">{fileError}</p>
      )}

      {previews.length > 0 && (
        <div className="space-y-4 rounded-xl border border-charcoal-light/10 bg-white p-4 shadow-luxury">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previews.map((p, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-ivory-dark">
                <img src={p.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute right-1 top-1 z-30 rounded-full bg-charcoal/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {!compact && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">Alt Text</label>
                <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image for accessibility" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">Caption</label>
                <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" />
              </div>
            </div>
          )}
          <Button onClick={handleUpload} disabled={isUploading} className="w-full sm:w-auto">
            {isUploading ? `Uploading${progress ? ` ${progress}%` : '...'}` : `Upload ${previews.length} image${previews.length > 1 ? 's' : ''}`}
          </Button>
          {isUploading && progress > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal/10">
              <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MediaGridProps {
  items: Array<{
    id: string;
    publicId: string;
    alt?: string;
    caption?: string;
    format: string;
    width: number;
    height: number;
    status: string;
    folder: string;
  }>;
  onSelect?: (id: string) => void;
  selectedId?: string;
}

export function MediaGrid({ items, onSelect, selectedId }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-charcoal-light/20 py-16 text-charcoal/40">
        <ImageIcon className="h-12 w-12" />
        <p className="mt-3">No images found</p>
        <p className="mt-1 text-xs">Upload images above to populate the library</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item.id)}
          className={cn(
            'group relative aspect-square overflow-hidden rounded-xl border-2 bg-ivory-dark transition',
            selectedId === item.id ? 'border-gold ring-2 ring-gold/30' : 'border-transparent hover:border-gold/30',
            item.status === 'deleted' && 'opacity-50',
          )}
        >
          <img src={getCloudinaryImageUrl(item.publicId)} alt={item.alt || ''} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
            <p className="truncate text-xs text-white">{item.alt || item.publicId.split('/').pop()}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
