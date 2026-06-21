import { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { CloudinaryImageInput } from '@sk-makeup/shared';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DraggableImageListProps {
  images: CloudinaryImageInput[];
  onChange: (images: CloudinaryImageInput[]) => void;
  onSetCover?: (image: CloudinaryImageInput) => void;
  coverPublicId?: string;
}

export function DraggableImageList({ images, onChange, onSetCover, coverPublicId }: DraggableImageListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  const updateAlt = (index: number, alt: string) => {
    const next = [...images];
    next[index] = { ...next[index], alt };
    onChange(next);
  };

  if (images.length === 0) {
    return <p className="text-sm text-charcoal/50">No gallery images yet. Add from media library.</p>;
  }

  return (
    <div className="space-y-3">
      {images.map((img, index) => (
        <div
          key={`${img.publicId}-${index}`}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (dragIndex !== null) move(dragIndex, index); setDragIndex(null); }}
          className="flex items-center gap-3 rounded-lg border border-charcoal/10 bg-ivory-dark/30 p-3"
        >
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-charcoal/30" />
          <img src={getCloudinaryImageUrl(img.publicId, 'adminGrid')} alt="" className="h-16 w-16 rounded object-cover" />
          <div className="min-w-0 flex-1 space-y-1">
            <Input value={img.alt || ''} onChange={(e) => updateAlt(index, e.target.value)} placeholder="Alt text" className="text-xs" />
            {coverPublicId === img.publicId && <span className="text-xs font-medium text-gold">Cover image</span>}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            {onSetCover && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onSetCover(img)}>Set Cover</Button>
            )}
            <div className="flex gap-1">
              <button type="button" onClick={() => move(index, index - 1)} className="rounded p-1 hover:bg-white" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(index, index + 1)} className="rounded p-1 hover:bg-white" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => remove(index)} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
