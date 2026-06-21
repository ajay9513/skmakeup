import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@sk-makeup/shared';
import type { CloudinaryImageInput } from '@sk-makeup/shared';
import { websiteContentApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { ImageField } from '@/components/media/ImagePicker';
import { CMS_PAGE_DEFINITIONS, type CmsFieldDef } from '@/lib/cms-definitions';

type ContentItem = {
  id: string;
  key: string;
  page: string;
  section: string;
  contentType: string;
  label: string;
  value: unknown;
  image?: CloudinaryImageInput;
  isVisible: boolean;
};

export function CmsHubPage() {
  const [activePage, setActivePage] = useState('homepage');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [images, setImages] = useState<Record<string, CloudinaryImageInput | undefined>>({});
  const [itemMap, setItemMap] = useState<Record<string, ContentItem>>({});
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.websiteContent.byPage(activePage), 'admin'],
    queryFn: async () => {
      const { data: res } = await websiteContentApi.byPage(activePage);
      return res.data as ContentItem[];
    },
  });

  const fields = CMS_PAGE_DEFINITIONS[activePage] ?? [];

  useEffect(() => {
    if (!data) return;
    const map: Record<string, ContentItem> = {};
    const vals: Record<string, unknown> = {};
    const imgs: Record<string, CloudinaryImageInput | undefined> = {};
    data.forEach((item) => {
      map[item.key] = item;
      if (item.contentType === 'image') {
        imgs[item.key] = (item.image || item.value) as CloudinaryImageInput | undefined;
      } else {
        vals[item.key] = item.value ?? '';
      }
    });
    fields.forEach((f) => {
      if (!(f.key in vals) && !(f.key in imgs)) {
        if (f.type === 'image') imgs[f.key] = undefined;
        else vals[f.key] = f.defaultValue ?? '';
      }
    });
    setItemMap(map);
    setValues(vals);
    setImages(imgs);
  }, [data, activePage]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allFields = [...fields];
      for (const field of allFields) {
        const existing = itemMap[field.key];
        const payload = {
          key: field.key,
          page: activePage,
          section: field.section,
          contentType: field.type,
          label: field.label,
          value: field.type === 'image' ? images[field.key] : values[field.key],
          image: field.type === 'image' ? images[field.key] : undefined,
          isVisible: true,
          locale: 'en',
          displayOrder: field.order ?? 0,
        };
        if (existing?.id) {
          await websiteContentApi.update(existing.id, payload);
        } else {
          await websiteContentApi.create(payload);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websiteContent.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.websiteContent.byPage(activePage) });
      setMessage('Content saved successfully');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err) => setMessage(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader />;

  const grouped = fields.reduce<Record<string, CmsFieldDef[]>>((acc, f) => {
    (acc[f.section] ||= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Website Content</h2>
          <p className="text-sm text-charcoal/60">Edit all public-facing content by page</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && <p className="rounded-lg bg-gold/10 px-4 py-2 text-sm text-gold-dark">{message}</p>}

      <div className="flex flex-wrap gap-2">
        {Object.keys(CMS_PAGE_DEFINITIONS).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setActivePage(page)}
            className={`rounded-lg px-4 py-2 text-sm capitalize transition ${activePage === page ? 'bg-charcoal text-ivory' : 'bg-ivory-dark text-charcoal hover:bg-charcoal/10'}`}
          >
            {page === 'global' ? 'Footer & Global' : page}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([section, sectionFields]) => (
          <Card key={section}>
            <CardHeader><CardTitle className="capitalize">{section.replace(/_/g, ' ')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sectionFields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  image={images[field.key]}
                  onValueChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                  onImageChange={(img) => setImages((prev) => ({ ...prev, [field.key]: img }))}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  image,
  onValueChange,
  onImageChange,
}: {
  field: CmsFieldDef;
  value: unknown;
  image?: CloudinaryImageInput;
  onValueChange: (v: unknown) => void;
  onImageChange: (img: CloudinaryImageInput | undefined) => void;
}) {
  if (field.type === 'image') {
    return <ImageField label={field.label} image={image} onChange={onImageChange} folder="homepage" />;
  }
  if (field.type === 'richtext') {
    return <Textarea label={field.label} value={String(value ?? '')} onChange={(e) => onValueChange(e.target.value)} rows={5} />;
  }
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-charcoal/70">{field.label}</label>
      <Input value={String(value ?? '')} onChange={(e) => onValueChange(e.target.value)} />
    </div>
  );
}
