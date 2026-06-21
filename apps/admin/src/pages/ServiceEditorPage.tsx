import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, type CloudinaryImageInput } from '@sk-makeup/shared';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { servicesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { ImageField } from '@/components/media/ImagePicker';
import { canDeleteContent, canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@sk-makeup/shared';

const CATEGORIES = ['bridal', 'reception', 'engagement', 'party', 'editorial', 'fashion', 'hd_makeup', 'airbrush', 'other'] as const;

export function ServiceEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: 'bridal' as string,
    duration: 120,
    startingPrice: 15000,
    currency: 'INR',
    isFeatured: false,
    isPublished: false,
    displayOrder: 0,
    featuredImage: undefined as CloudinaryImageInput | undefined,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.services.detail(id!),
    queryFn: async () => {
      const { data: res } = await servicesApi.get(id!);
      return res.data as Record<string, unknown>;
    },
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title as string,
      shortDescription: data.shortDescription as string,
      fullDescription: data.fullDescription as string,
      category: data.category as string,
      duration: data.duration as number,
      startingPrice: data.startingPrice as number,
      currency: (data.currency as string) || 'INR',
      isFeatured: Boolean(data.isFeatured),
      isPublished: Boolean(data.isPublished),
      displayOrder: (data.displayOrder as number) || 0,
      featuredImage: data.featuredImage as CloudinaryImageInput,
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.featuredImage) throw new Error('Featured image is required');
      const payload = { ...form };
      if (isNew) {
        const { data: res } = await servicesApi.create(payload);
        return res.data as { id: string };
      }
      const { data: res } = await servicesApi.update(id!, payload);
      return res.data as { id: string };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      if (isNew) navigate(`/services/${result.id}/edit`, { replace: true });
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => servicesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      navigate('/services');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (!isNew && isLoading) return <PageLoader />;
  if (!canManageContent(role)) return <p className="text-charcoal/60">You do not have permission to edit services.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/services"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button></Link>
        <h2 className="font-serif text-2xl">{isNew ? 'New Service' : 'Edit Service'}</h2>
      </div>

      {error && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}

      <Card>
        <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Short Description</label>
            <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <Textarea label="Full Description" value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} rows={5} />
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Category</label>
            <select className="luxury-input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Duration (min)</label>
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Starting Price</label>
              <Input type="number" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Currency</label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
          </div>
          <ImageField label="Featured Image" image={form.featuredImage} onChange={(img) => setForm({ ...form, featuredImage: img })} folder="services" />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save Service'}</Button>
        {!isNew && canDeleteContent(role) && (
          <Button variant="destructive" onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
