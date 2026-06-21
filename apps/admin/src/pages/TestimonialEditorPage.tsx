import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, type CloudinaryImageInput } from '@sk-makeup/shared';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { testimonialsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { ImageField } from '@/components/media/ImagePicker';
import { canDeleteContent, canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@sk-makeup/shared';

export function TestimonialEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    clientName: '',
    clientRole: '',
    content: '',
    rating: 5,
    avatar: undefined as CloudinaryImageInput | undefined,
    isPublished: false,
    isFeatured: false,
    displayOrder: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.testimonials.detail(id!),
    queryFn: async () => {
      const { data: res } = await testimonialsApi.get(id!);
      return res.data as Record<string, unknown>;
    },
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      clientName: data.clientName as string,
      clientRole: (data.clientRole as string) || '',
      content: data.content as string,
      rating: data.rating as number,
      avatar: data.avatar as CloudinaryImageInput | undefined,
      isPublished: Boolean(data.isPublished),
      isFeatured: Boolean(data.isFeatured),
      displayOrder: (data.displayOrder as number) || 0,
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, clientRole: form.clientRole || undefined, avatar: form.avatar };
      if (isNew) {
        const { data: res } = await testimonialsApi.create(payload);
        return res.data as { id: string };
      }
      const { data: res } = await testimonialsApi.update(id!, payload);
      return res.data as { id: string };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
      if (isNew) navigate(`/testimonials/${result.id}/edit`, { replace: true });
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => testimonialsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
      navigate('/testimonials');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (!isNew && isLoading) return <PageLoader />;
  if (!canManageContent(role)) return <p className="text-charcoal/60">You do not have permission to edit testimonials.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/testimonials"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button></Link>
        <h2 className="font-serif text-2xl">{isNew ? 'New Testimonial' : 'Edit Testimonial'}</h2>
      </div>
      {error && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Client Name</label>
            <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Role / Event</label>
            <Input value={form.clientRole} onChange={(e) => setForm({ ...form, clientRole: e.target.value })} />
          </div>
          <Textarea label="Testimonial" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} />
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Rating (1-5)</label>
            <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
          </div>
          <ImageField label="Avatar (optional)" image={form.avatar} onChange={(img) => setForm({ ...form, avatar: img })} folder="testimonials" />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
        {!isNew && canDeleteContent(role) && (
          <Button variant="destructive" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(); }}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
        )}
      </div>
    </div>
  );
}
