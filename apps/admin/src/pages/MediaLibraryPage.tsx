import { useState, useRef } from 'react';
import { Search, Trash2, RotateCcw, Edit2, Replace } from 'lucide-react';
import { MEDIA_FOLDERS } from '@sk-makeup/shared';
import { MediaUploadZone, MediaGrid } from '@/components/media/MediaUploadZone';
import { useMediaList, useMediaUpload, useMediaDelete, useMediaRestore, useMediaUpdate, useMediaReplace, MediaItem } from '@/hooks/useMedia';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { canUploadMedia, canDeleteContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@sk-makeup/shared';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

export function MediaLibraryPage() {
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<string>('temp');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');

  const params = { search: search || undefined, folder: folder || undefined, status: 'active' as const };
  const { data, isLoading, refetch } = useMediaList(params);
  const uploadMutation = useMediaUpload(folder);
  const deleteMutation = useMediaDelete();
  const restoreMutation = useMediaRestore();
  const updateMutation = useMediaUpdate();
  const replaceMutation = useMediaReplace();
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const selected = (data?.items as MediaItem[] | undefined)?.find((i) => i.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const item = (data?.items as MediaItem[])?.find((i) => i.id === id);
    if (item) {
      setEditAlt(item.alt || '');
      setEditCaption(item.caption || '');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {canUploadMedia(role) && (
        <Card>
          <CardHeader><CardTitle>Upload Images</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Upload Folder</label>
              <select value={folder} onChange={(e) => setFolder(e.target.value)} className="luxury-input max-w-xs">
                {MEDIA_FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <MediaUploadZone
              folder={folder}
              multiple
              isUploading={uploadMutation.isPending}
              onUpload={async (files, meta, onProgress) => {
                await uploadMutation.mutateAsync({ files, alt: meta.alt, caption: meta.caption, onProgress });
                refetch();
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by alt, caption, filename..." className="pl-9" />
        </div>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className="luxury-input w-auto">
          <option value="">All folders</option>
          {MEDIA_FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MediaGrid
            items={(data?.items as MediaItem[]) || []}
            selectedId={selectedId || undefined}
            onSelect={handleSelect}
          />
          {data?.meta && (
            <p className="mt-4 text-sm text-charcoal/50">
              Showing {data.items?.length} of {(data.meta as { total: number }).total} images
            </p>
          )}
        </div>

        {selected && (
          <Card className="h-fit">
            <CardHeader><CardTitle className="text-base">Image Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <img src={getCloudinaryImageUrl(selected.publicId, 'gallery')} alt={selected.alt} className="w-full rounded-lg" />
              <div className="space-y-1 text-xs text-charcoal/60">
                <p>{selected.width} × {selected.height} — {selected.format.toUpperCase()}</p>
                <p>{(selected.size / 1024).toFixed(1)} KB</p>
                <Badge variant="outline">{selected.folder}</Badge>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Alt Text</label>
                <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Caption</label>
                <Input value={editCaption} onChange={(e) => setEditCaption(e.target.value)} />
              </div>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => updateMutation.mutate({ id: selected.id, data: { alt: editAlt, caption: editCaption } })}
              >
                <Edit2 className="h-4 w-4" /> Save Metadata
              </Button>
              {canUploadMedia(role) && selected.status === 'active' && (
                <>
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    type="button"
                    onClick={() => replaceInputRef.current?.click()}
                    disabled={replaceMutation.isPending}
                  >
                    <Replace className="h-4 w-4" /> {replaceMutation.isPending ? 'Replacing...' : 'Replace Image'}
                  </Button>
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                    className="absolute h-0 w-0 overflow-hidden opacity-0"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && selected) {
                        replaceMutation.mutate({ id: selected.id, file }, { onSuccess: () => refetch() });
                      }
                      e.target.value = '';
                    }}
                  />
                </>
              )}
              {canDeleteContent(role) && selected.status === 'active' && (
                <Button variant="destructive" className="w-full gap-2" onClick={() => { deleteMutation.mutate(selected.id); setSelectedId(null); }}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
              {selected.status === 'deleted' && (
                <Button variant="secondary" className="w-full gap-2" onClick={() => restoreMutation.mutate(selected.id)}>
                  <RotateCcw className="h-4 w-4" /> Restore
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
