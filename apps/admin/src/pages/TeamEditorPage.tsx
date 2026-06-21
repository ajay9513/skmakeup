import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, type CloudinaryImageInput } from '@sk-makeup/shared';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { teamMembersApi } from '@/lib/api';
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

export function TeamEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    designation: '',
    description: '',
    shortDescription: '',
    profileImage: undefined as CloudinaryImageInput | undefined,
    specialties: '',
    experienceYears: 5,
    isPublished: false,
    isFeatured: false,
    displayOrder: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.teamMembers.detail(id!),
    queryFn: async () => {
      const { data: res } = await teamMembersApi.get(id!);
      return res.data as Record<string, unknown>;
    },
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name as string,
      designation: data.designation as string,
      description: data.description as string,
      shortDescription: (data.shortDescription as string) || '',
      profileImage: data.profileImage as CloudinaryImageInput,
      specialties: ((data.specialties as string[]) || []).join(', '),
      experienceYears: (data.experienceYears as number) || 0,
      isPublished: Boolean(data.isPublished),
      isFeatured: Boolean(data.isFeatured),
      displayOrder: (data.displayOrder as number) || 0,
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.profileImage) throw new Error('Profile image is required');
      const payload = {
        ...form,
        shortDescription: form.shortDescription || undefined,
        specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (isNew) {
        const { data: res } = await teamMembersApi.create(payload);
        return res.data as { id: string };
      }
      const { data: res } = await teamMembersApi.update(id!, payload);
      return res.data as { id: string };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      if (isNew) navigate(`/team/${result.id}/edit`, { replace: true });
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => teamMembersApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      navigate('/team');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (!isNew && isLoading) return <PageLoader />;
  if (!canManageContent(role)) return <p className="text-charcoal/60">You do not have permission to edit team members.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/team"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button></Link>
        <h2 className="font-serif text-2xl">{isNew ? 'New Team Member' : 'Edit Team Member'}</h2>
      </div>
      {error && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Designation</label>
            <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Short Description</label>
            <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <Textarea label="Full Bio" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Specialties (comma-separated)</label>
            <Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Years Experience</label>
            <Input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          </div>
          <ImageField label="Profile Image" image={form.profileImage} onChange={(img) => setForm({ ...form, profileImage: img })} folder="team" />
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
