import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, PORTFOLIO_CATEGORIES, type CloudinaryImageInput } from '@sk-makeup/shared';
import { ArrowLeft, Copy, ExternalLink, Eye, Star, Trash2 } from 'lucide-react';
import { portfolioApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { ImageField, ImagePicker } from '@/components/media/ImagePicker';
import { DraggableImageList } from '@/components/media/DraggableImageList';
import { SeoFields, seoFormToSnapshot, snapshotToSeoForm } from '@/components/forms/SeoFields';
import { canDeleteContent, canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@sk-makeup/shared';

interface PortfolioForm {
  title: string;
  category: string;
  description: string;
  featuredImage?: CloudinaryImageInput;
  galleryImages: CloudinaryImageInput[];
  beforeImage?: CloudinaryImageInput;
  afterImage?: CloudinaryImageInput;
  tags: string;
  featured: boolean;
  published: boolean;
  scheduledPublishAt: string;
  displayOrder: number;
  seo: ReturnType<typeof snapshotToSeoForm>;
  previewToken?: string;
  slug?: string;
}

const emptyForm = (): PortfolioForm => ({
  title: '',
  category: PORTFOLIO_CATEGORIES[0],
  description: '',
  galleryImages: [],
  tags: '',
  featured: false,
  published: false,
  scheduledPublishAt: '',
  displayOrder: 0,
  seo: {},
});

export function PortfolioEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const [form, setForm] = useState<PortfolioForm>(emptyForm());
  const [tab, setTab] = useState<'content' | 'images' | 'seo'>('content');
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.portfolio.detail(id!),
    queryFn: async () => {
      const { data: res } = await portfolioApi.get(id!);
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
      featuredImage: data.featuredImage as CloudinaryImageInput,
      galleryImages: (data.galleryImages as CloudinaryImageInput[]) || [],
      beforeImage: data.beforeImage as CloudinaryImageInput | undefined,
      afterImage: data.afterImage as CloudinaryImageInput | undefined,
      tags: ((data.tags as string[]) || []).join(', '),
      featured: Boolean(data.featured),
      published: Boolean(data.published),
      scheduledPublishAt: data.scheduledPublishAt ? String(data.scheduledPublishAt).slice(0, 16) : '',
      displayOrder: (data.displayOrder as number) || 0,
      seo: snapshotToSeoForm(data.seo as Record<string, unknown>),
      previewToken: data.previewToken as string | undefined,
      slug: data.slug as string,
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.featuredImage) throw new Error('Cover image is required');
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || undefined,
        featuredImage: form.featuredImage,
        galleryImages: form.galleryImages,
        beforeImage: form.beforeImage,
        afterImage: form.afterImage,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: form.featured,
        published: form.published,
        scheduledPublishAt: form.scheduledPublishAt ? new Date(form.scheduledPublishAt).toISOString() : null,
        displayOrder: form.displayOrder,
        seo: seoFormToSnapshot(form.seo),
      };
      if (isNew) {
        const { data: res } = await portfolioApi.create(payload);
        return res.data as { id: string };
      }
      const { data: res } = await portfolioApi.update(id!, payload);
      return res.data as { id: string };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      if (isNew) navigate(`/portfolio/${result.id}/edit`, { replace: true });
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => portfolioApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      navigate('/portfolio');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => portfolioApi.duplicate(id!),
    onSuccess: (res) => {
      const newId = (res.data.data as { id: string }).id;
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      navigate(`/portfolio/${newId}/edit`);
    },
  });

  const previewMutation = useMutation({
    mutationFn: () => portfolioApi.regeneratePreviewToken(id!),
    onSuccess: (res) => {
      const { previewToken, slug } = res.data.data as { previewToken: string; slug: string };
      setForm((f) => ({ ...f, previewToken }));
      const webUrl = import.meta.env.VITE_WEB_URL || 'http://localhost:5173';
      window.open(`${webUrl}/portfolio/${slug}?preview=${previewToken}`, '_blank');
    },
  });

  const set = (patch: Partial<PortfolioForm>) => setForm((f) => ({ ...f, ...patch }));

  if (!isNew && isLoading) return <PageLoader />;

  const previewUrl = form.previewToken && form.slug
    ? `${import.meta.env.VITE_WEB_URL || 'http://localhost:5173'}/portfolio/${form.slug}?preview=${form.previewToken}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/portfolio" className="rounded-lg p-2 hover:bg-ivory-dark"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="font-serif text-2xl font-semibold">{isNew ? 'Create Portfolio' : 'Edit Portfolio'}</h2>
            <p className="text-sm text-charcoal/60">{form.published ? 'Published' : form.scheduledPublishAt ? 'Scheduled' : 'Draft'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && previewUrl && (
            <Button type="button" variant="secondary" size="sm" onClick={() => window.open(previewUrl, '_blank')} className="gap-1">
              <Eye className="h-4 w-4" /> Preview
            </Button>
          )}
          {!isNew && canManageContent(role) && (
            <>
              <Button type="button" variant="secondary" size="sm" onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending} className="gap-1">
                <ExternalLink className="h-4 w-4" /> New Preview Link
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => duplicateMutation.mutate()} disabled={duplicateMutation.isPending} className="gap-1">
                <Copy className="h-4 w-4" /> Duplicate
              </Button>
            </>
          )}
          {canDeleteContent(role) && !isNew && (
            <Button type="button" variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} className="gap-1">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex gap-2 border-b border-charcoal/10">
        {(['content', 'images', 'seo'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`px-4 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-gold text-charcoal' : 'text-charcoal/50'}`}>{t}</button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">Title</label>
                <Input value={form.title} onChange={(e) => set({ title: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">Category</label>
                <select value={form.category} onChange={(e) => set({ category: e.target.value })} className="luxury-input w-full">
                  {PORTFOLIO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Textarea label="Description" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={5} />
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">Tags (comma-separated)</label>
                <Input value={form.tags} onChange={(e) => set({ tags: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">Display Order</label>
                <Input type="number" value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => set({ published: e.target.checked, scheduledPublishAt: e.target.checked ? '' : form.scheduledPublishAt })} />
                <span className="text-sm">Published (live on website)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} />
                <span className="text-sm flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> Featured</span>
              </label>
              {!form.published && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-charcoal/70">Schedule Publish</label>
                  <Input type="datetime-local" value={form.scheduledPublishAt} onChange={(e) => set({ scheduledPublishAt: e.target.value })} />
                </div>
              )}
              <ImageField label="Cover Image" image={form.featuredImage} onChange={(featuredImage) => set({ featuredImage })} folder="portfolio" />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'images' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gallery</CardTitle>
              <Button type="button" size="sm" onClick={() => setGalleryPickerOpen(true)}>Add Images</Button>
            </CardHeader>
            <CardContent>
              <DraggableImageList
                images={form.galleryImages}
                onChange={(galleryImages) => set({ galleryImages })}
                onSetCover={(img) => set({ featuredImage: img })}
                coverPublicId={form.featuredImage?.publicId}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Before / After</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <ImageField label="Before Image" image={form.beforeImage} onChange={(beforeImage) => set({ beforeImage })} folder="portfolio" />
              <ImageField label="After Image" image={form.afterImage} onChange={(afterImage) => set({ afterImage })} folder="portfolio" />
            </CardContent>
          </Card>
          <ImagePicker
            open={galleryPickerOpen}
            onClose={() => setGalleryPickerOpen(false)}
            folder="portfolio"
            title="Add Gallery Images"
            onSelect={(img) => set({ galleryImages: [...form.galleryImages, { ...img, order: form.galleryImages.length }] })}
          />
        </div>
      )}

      {tab === 'seo' && (
        <Card>
          <CardHeader><CardTitle>Portfolio SEO</CardTitle></CardHeader>
          <CardContent>
            <SeoFields value={form.seo} onChange={(seo) => set({ seo })} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
