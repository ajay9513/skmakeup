import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, PORTFOLIO_CATEGORIES, type CloudinaryImageInput } from '@sk-makeup/shared';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { galleryApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { ImagePicker } from '@/components/media/ImagePicker';
import { DraggableImageList } from '@/components/media/DraggableImageList';
import { canDeleteContent, canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@sk-makeup/shared';

const GALLERY_CATEGORIES = [...PORTFOLIO_CATEGORIES, 'General'] as const;

export function GalleryEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: GALLERY_CATEGORIES[0] as string,
    description: '',
    images: [] as CloudinaryImageInput[],
    featured: false,
    isPublished: false,
    displayOrder: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.gallery.detail(id!),
    queryFn: async () => {
      const { data: res } = await galleryApi.get(id!);
      return res.data as Record<string, unknown>;
    },
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title as string,
      category: data.category as string,
      description: (data.description as string) || '',
      images: (data.images as CloudinaryImageInput[]) || [],
      featured: Boolean(data.featured),
      isPublished: Boolean(data.isPublished),
      displayOrder: (data.displayOrder as number) || 0,
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.images.length) throw new Error('Add at least one image');
      if (isNew) {
        const { data: res } = await galleryApi.create(form);
        return res.data as { id: string };
      }
      const { data: res } = await galleryApi.update(id!, form);
      return res.data as { id: string };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
      if (isNew) navigate(`/gallery/${result.id}/edit`, { replace: true });
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => galleryApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
      navigate('/gallery');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (!isNew && isLoading) return <PageLoader />;
  if (!canManageContent(role)) return <p className="text-charcoal/60">You do not have permission to edit gallery.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/gallery"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button></Link>
        <h2 className="font-serif text-2xl">{isNew ? 'New Gallery Album' : 'Edit Gallery Album'}</h2>
      </div>
      {error && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <Card>
        <CardHeader><CardTitle>Album Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Category</label>
            <select className="luxury-input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal/70">Images</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => setPickerOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" /> Add Images
            </Button>
          </div>
          <DraggableImageList images={form.images} onChange={(images) => setForm({ ...form, images })} />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          </div>
        </CardContent>
      </Card>
      <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} folder="gallery" onSelect={(img) => setForm({ ...form, images: [...form.images, img] })} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save Album</Button>
        {!isNew && canDeleteContent(role) && (
          <Button variant="destructive" onClick={() => { if (confirm('Delete this album?')) deleteMutation.mutate(); }}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
        )}
      </div>
    </div>
  );
}
