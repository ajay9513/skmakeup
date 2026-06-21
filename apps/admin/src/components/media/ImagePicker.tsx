import { useState } from 'react';
import { Search, Upload } from 'lucide-react';
import type { CloudinaryImageInput } from '@sk-makeup/shared';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMediaList, useMediaUpload, MediaItem } from '@/hooks/useMedia';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { mediaToCloudinaryImage } from '@/lib/media-mapper';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (image: CloudinaryImageInput) => void;
  folder?: string;
  title?: string;
}

export function ImagePicker({ open, onClose, onSelect, folder = 'portfolio', title = 'Select Image' }: ImagePickerProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const { data, isLoading, refetch } = useMediaList({ search: search || undefined, folder, status: 'active', limit: 40 });
  const uploadMutation = useMediaUpload(folder);

  const items = (data?.items ?? []) as MediaItem[];

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      <div className="mb-4 flex gap-2 border-b border-charcoal/10 pb-3">
        <button
          type="button"
          onClick={() => setTab('library')}
          className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'library' ? 'bg-charcoal text-ivory' : 'text-charcoal/60 hover:bg-ivory-dark'}`}
        >
          Media Library
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${tab === 'upload' ? 'bg-charcoal text-ivory' : 'text-charcoal/60 hover:bg-ivory-dark'}`}
        >
          <Upload className="h-3.5 w-3.5" /> Upload New
        </button>
      </div>

      {tab === 'upload' ? (
        <MediaUploadZone
          folder={folder}
          compact
          isUploading={uploadMutation.isPending}
          onUpload={async (files, meta, onProgress) => {
            const result = await uploadMutation.mutateAsync({ files, alt: meta.alt, caption: meta.caption, onProgress });
            await refetch();
            const uploaded = Array.isArray(result) ? result[0] : result;
            if (uploaded && typeof uploaded === 'object' && 'publicId' in (uploaded as object)) {
              onSelect(mediaToCloudinaryImage(uploaded as MediaItem));
              onClose();
            } else {
              setTab('library');
            }
          }}
        />
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="pl-9" />
          </div>
          {isLoading ? (
            <p className="py-8 text-center text-charcoal/50">Loading...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSelect(mediaToCloudinaryImage(item)); onClose(); }}
                  className="group overflow-hidden rounded-lg border border-charcoal/10 transition hover:border-gold hover:shadow-gold"
                >
                  <img src={getCloudinaryImageUrl(item.publicId, 'adminGrid')} alt={item.alt} className="aspect-square w-full object-cover transition group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-charcoal/50">No images in this folder yet.</p>
              <Button type="button" className="mt-3 gap-2" onClick={() => setTab('upload')}>
                <Upload className="h-4 w-4" /> Upload Image
              </Button>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}

interface ImageFieldProps {
  label: string;
  image?: CloudinaryImageInput | null;
  onChange: (image: CloudinaryImageInput | undefined) => void;
  folder?: string;
}

export function ImageField({ label, image, onChange, folder }: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-charcoal/70">{label}</span>
      <div className="flex items-start gap-4">
        {image?.publicId ? (
          <img src={getCloudinaryImageUrl(image.publicId, 'adminGrid')} alt={image.alt} className="h-24 w-24 rounded-lg object-cover shadow-luxury" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-charcoal/20 bg-ivory-dark text-xs text-charcoal/40">No image</div>
        )}
        <div className="flex flex-col gap-2">
          <Button type="button" size="sm" onClick={() => setPickerOpen(true)}>{image ? 'Change' : 'Select'} Image</Button>
          {image && (
            <>
              <Input placeholder="Alt text" value={image.alt || ''} onChange={(e) => onChange({ ...image, alt: e.target.value })} className="text-xs" />
              <Input placeholder="Caption (optional)" value={image.caption || ''} onChange={(e) => onChange({ ...image, caption: e.target.value })} className="text-xs" />
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange(undefined)}>Remove</Button>
            </>
          )}
        </div>
      </div>
      <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} folder={folder} />
    </div>
  );
}
