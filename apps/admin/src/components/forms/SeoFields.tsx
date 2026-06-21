import type { CloudinaryImageInput } from '@sk-makeup/shared';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageField } from '@/components/media/ImagePicker';

export interface SeoFormData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: CloudinaryImageInput;
}

interface SeoFieldsProps {
  value: SeoFormData;
  onChange: (value: SeoFormData) => void;
}

export function SeoFields({ value, onChange }: SeoFieldsProps) {
  const set = (patch: Partial<SeoFormData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-charcoal/70">Meta Title</label>
        <Input value={value.metaTitle || ''} onChange={(e) => set({ metaTitle: e.target.value })} maxLength={70} />
      </div>
      <Textarea label="Meta Description" value={value.metaDescription || ''} onChange={(e) => set({ metaDescription: e.target.value })} maxLength={160} rows={3} />
      <div>
        <label className="mb-1 block text-xs font-medium text-charcoal/70">Keywords (comma-separated)</label>
        <Input value={(value.keywords || []).join(', ')} onChange={(e) => set({ keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-charcoal/70">Canonical URL</label>
        <Input type="url" value={value.canonicalUrl || ''} onChange={(e) => set({ canonicalUrl: e.target.value })} />
      </div>
      <div className="border-t border-charcoal/10 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-charcoal/50">Open Graph</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">OG Title</label>
            <Input value={value.ogTitle || ''} onChange={(e) => set({ ogTitle: e.target.value })} />
          </div>
          <Textarea label="OG Description" value={value.ogDescription || ''} onChange={(e) => set({ ogDescription: e.target.value })} rows={2} />
          <ImageField label="OG Image" image={value.ogImage} onChange={(ogImage) => set({ ogImage })} folder="seo" />
        </div>
      </div>
    </div>
  );
}

export function seoFormToSnapshot(value: SeoFormData) {
  return {
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    keywords: value.keywords,
    canonicalUrl: value.canonicalUrl,
    ogTitle: value.ogTitle,
    ogDescription: value.ogDescription,
    ogImage: value.ogImage,
  };
}

export function snapshotToSeoForm(seo: Record<string, unknown> | undefined): SeoFormData {
  if (!seo) return {};
  return {
    metaTitle: seo.metaTitle as string | undefined,
    metaDescription: seo.metaDescription as string | undefined,
    keywords: seo.keywords as string[] | undefined,
    canonicalUrl: seo.canonicalUrl as string | undefined,
    ogTitle: seo.ogTitle as string | undefined,
    ogDescription: seo.ogDescription as string | undefined,
    ogImage: seo.ogImage as CloudinaryImageInput | undefined,
  };
}
