import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@sk-makeup/shared';
import { Edit2 } from 'lucide-react';
import { ContentListPage, StatusBadge } from '@/components/content/ContentListPage';
import { useCrudList } from '@/hooks/useMedia';
import { seoApi } from '@/lib/api';
import { canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@sk-makeup/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { SeoFields, snapshotToSeoForm, seoFormToSnapshot } from '@/components/forms/SeoFields';
import { getErrorMessage } from '@/lib/axios';

export function SeoPage() {
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ scope: 'page', page: 'homepage', metaTitle: '', metaDescription: '', isActive: true });
  const [error, setError] = useState('');
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const queryClient = useQueryClient();
  const { data, isLoading } = useCrudList(queryKeys.seo.all, seoApi.list, { search: search || undefined });
  const items = (data?.items || []) as Array<{ id: string; scope: string; page?: string; metaTitle: string; isActive: boolean }>;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const seoForm = (form.seoForm || {}) as ReturnType<typeof snapshotToSeoForm>;
      const snapshot = seoFormToSnapshot(seoForm);
      const { seoForm: _, ...rest } = form;
      const payload = {
        ...rest,
        metaTitle: snapshot.metaTitle ?? form.metaTitle,
        metaDescription: snapshot.metaDescription ?? form.metaDescription,
        keywords: snapshot.keywords,
        canonicalUrl: snapshot.canonicalUrl,
        openGraph: {
          title: snapshot.ogTitle,
          description: snapshot.ogDescription,
          image: snapshot.ogImage,
        },
      };
      if (editingId) return seoApi.update(editingId, payload);
      return seoApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seo.all });
      setEditorOpen(false);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ scope: 'page', page: 'homepage', metaTitle: '', metaDescription: '', isActive: true, seoForm: {} });
    setEditorOpen(true);
  };

  const openEdit = async (id: string) => {
    const { data: res } = await seoApi.get(id);
    const item = res.data as Record<string, unknown>;
    setEditingId(id);
    setForm({
      ...item,
      seoForm: snapshotToSeoForm({
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        keywords: item.keywords,
        canonicalUrl: item.canonicalUrl,
        ogTitle: (item.openGraph as Record<string, unknown>)?.title,
        ogDescription: (item.openGraph as Record<string, unknown>)?.description,
        ogImage: (item.openGraph as Record<string, unknown>)?.image,
      }),
    });
    setEditorOpen(true);
  };

  return (
    <>
      <ContentListPage
        title="SEO Management"
        description="Meta titles, descriptions, and structured data"
        items={items}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        canCreate={canManageContent(role)}
        onCreate={openCreate}
        columns={[
          { key: 'scope', header: 'Scope', render: (i) => i.scope },
          { key: 'page', header: 'Page', render: (i) => i.page || '—' },
          { key: 'title', header: 'Meta Title', render: (i) => <span className="truncate max-w-xs block">{i.metaTitle}</span> },
          { key: 'active', header: 'Active', render: (i) => <StatusBadge published={i.isActive} /> },
          {
            key: 'actions',
            header: '',
            render: (i) => canManageContent(role) ? (
              <Button size="sm" variant="ghost" onClick={() => openEdit(i.id)} className="gap-1"><Edit2 className="h-3 w-3" /> Edit</Button>
            ) : null,
          },
        ]}
      />

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editingId ? 'Edit SEO' : 'Create SEO'} size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Scope</label>
              <select value={String(form.scope)} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="luxury-input w-full">
                <option value="page">Page</option>
                <option value="global">Global</option>
                <option value="entity">Entity</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Page</label>
              <Input value={String(form.page || '')} onChange={(e) => setForm({ ...form, page: e.target.value })} />
            </div>
          </div>
          <SeoFields
            value={(form.seoForm || {}) as ReturnType<typeof snapshotToSeoForm>}
            onChange={(seoForm) => setForm({ ...form, seoForm, metaTitle: seoForm.metaTitle, metaDescription: seoForm.metaDescription })}
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span className="text-sm">Active</span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
