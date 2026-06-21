import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@sk-makeup/shared';
import type { CloudinaryImageInput } from '@sk-makeup/shared';
import { settingsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { ImageField } from '@/components/media/ImagePicker';
import { SeoFields, snapshotToSeoForm, seoFormToSnapshot } from '@/components/forms/SeoFields';
import { canManageSettings } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@sk-makeup/shared';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function SettingsCenterPage() {
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('general');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.settings.site,
    queryFn: async () => {
      const { data: res } = await settingsApi.get();
      return res.data as Record<string, unknown>;
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: unknown) => settingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.site });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.settings });
      setMessage('Settings saved');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err) => setMessage(getErrorMessage(err)),
  });

  const set = (patch: Record<string, unknown>) => setForm((f) => ({ ...f, ...patch }));
  const contact = (form.contactDetails || {}) as Record<string, string>;
  const social = (form.socialLinks || {}) as Record<string, string>;
  const analytics = (form.analyticsIds || {}) as Record<string, string>;
  const brand = (form.brandColors || {}) as Record<string, string>;
  const booking = (form.bookingSettings || {}) as Record<string, unknown>;
  const conversion = (form.conversionSettings || {}) as Record<string, unknown>;
  const cloudinary = (form.cloudinarySettings || {}) as Record<string, string>;
  const branding = (form.brandingSettings || {}) as Record<string, CloudinaryImageInput | undefined>;
  const hours = (form.businessHours || {}) as Record<string, { open?: string; close?: string; closed?: boolean }>;

  const setBranding = (key: string, value: CloudinaryImageInput | undefined) => {
    const next = { ...branding, [key]: value };
    set({ brandingSettings: next, logo: key === 'logo' ? value : form.logo ?? next.logo });
  };

  if (isLoading) return <PageLoader />;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social' },
    { id: 'hours', label: 'Business Hours' },
    { id: 'booking', label: 'Booking' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'seo', label: 'SEO Defaults' },
    { id: 'branding', label: 'Branding' },
    { id: 'brand', label: 'Brand Colors' },
    { id: 'cloudinary', label: 'Cloudinary' },
  ];

  const handleSave = () => {
    const brandingSettings = form.brandingSettings as Record<string, unknown> | undefined;
    const payload = {
      ...form,
      logo: brandingSettings?.logo ?? form.logo,
      seoDefaults: seoFormToSnapshot(snapshotToSeoForm(form.seoDefaults as Record<string, unknown>)),
    };
    updateMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Settings Center</h2>
          <p className="text-sm text-charcoal/60">Enterprise configuration for your platform</p>
        </div>
        {canManageSettings(role) && (
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </Button>
        )}
      </div>

      {message && <p className="rounded-lg bg-gold/10 px-4 py-2 text-sm">{message}</p>}

      <div className="flex flex-wrap gap-2 border-b border-charcoal/10 pb-2">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-lg px-3 py-1.5 text-sm ${tab === t.id ? 'bg-charcoal text-ivory' : 'text-charcoal/60 hover:bg-ivory-dark'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <Card>
          <CardHeader><CardTitle>Site Identity</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Site Name</label>
              <Input value={String(form.siteName || '')} onChange={(e) => set({ siteName: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Tagline</label>
              <Input value={String(form.tagline || '')} onChange={(e) => set({ tagline: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-charcoal/50">Upload logo, favicon, and icons in the <button type="button" className="text-gold underline" onClick={() => setTab('branding')}>Branding</button> tab.</p>
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={Boolean(form.maintenanceMode)} onChange={(e) => set({ maintenanceMode: e.target.checked })} />
              <span className="text-sm">Maintenance Mode</span>
            </label>
          </CardContent>
        </Card>
      )}

      {tab === 'contact' && (
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(['email', 'phone', 'whatsappNumber', 'address'] as const).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium capitalize text-charcoal/70">{key.replace(/([A-Z])/g, ' $1')}</label>
                <Input
                  value={contact[key] || ''}
                  onChange={(e) => set({ contactDetails: { ...contact, [key]: e.target.value } })}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Map Embed URL</label>
              <Input value={contact.mapEmbedUrl || ''} onChange={(e) => set({ contactDetails: { ...contact, mapEmbedUrl: e.target.value } })} />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'social' && (
        <Card>
          <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'whatsapp'] as const).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium capitalize text-charcoal/70">{key}</label>
                <Input value={social[key] || ''} onChange={(e) => set({ socialLinks: { ...social, [key]: e.target.value } })} placeholder={`https://${key}.com/...`} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'hours' && (
        <Card>
          <CardHeader><CardTitle>Business Hours</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day) => {
              const h = hours[day] || {};
              return (
                <div key={day} className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-3">
                  <span className="capitalize text-sm">{day}</span>
                  <Input type="time" value={h.open || ''} onChange={(e) => set({ businessHours: { ...hours, [day]: { ...h, open: e.target.value } } })} disabled={h.closed} />
                  <Input type="time" value={h.close || ''} onChange={(e) => set({ businessHours: { ...hours, [day]: { ...h, close: e.target.value } } })} disabled={h.closed} />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={Boolean(h.closed)} onChange={(e) => set({ businessHours: { ...hours, [day]: { ...h, closed: e.target.checked } } })} />
                    Closed
                  </label>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {tab === 'booking' && (
        <Card>
          <CardHeader><CardTitle>Booking Settings</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Min Advance Days</label>
              <Input type="number" value={Number(booking.minAdvanceDays ?? 1)} onChange={(e) => set({ bookingSettings: { ...booking, minAdvanceDays: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Max Advance Days</label>
              <Input type="number" value={Number(booking.maxAdvanceDays ?? 90)} onChange={(e) => set({ bookingSettings: { ...booking, maxAdvanceDays: Number(e.target.value) } })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Confirmation Message</label>
              <Input value={String(booking.confirmationMessage || '')} onChange={(e) => set({ bookingSettings: { ...booking, confirmationMessage: e.target.value } })} />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'conversion' && (
        <Card>
          <CardHeader><CardTitle>Conversion Optimization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={conversion.stickyCtaEnabled !== false} onChange={(e) => set({ conversionSettings: { ...conversion, stickyCtaEnabled: e.target.checked } })} />
              <span className="text-sm">Enable Sticky CTA Bar</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input value={String(conversion.stickyCtaLabel || 'Book Now')} onChange={(e) => set({ conversionSettings: { ...conversion, stickyCtaLabel: e.target.value } })} placeholder="Sticky CTA Label" />
              <Input value={String(conversion.stickyCtaHref || '/book')} onChange={(e) => set({ conversionSettings: { ...conversion, stickyCtaHref: e.target.value } })} placeholder="Sticky CTA Link" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={conversion.floatingWhatsappEnabled !== false} onChange={(e) => set({ conversionSettings: { ...conversion, floatingWhatsappEnabled: e.target.checked } })} />
              <span className="text-sm">Enable Floating WhatsApp Button</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={conversion.floatingCallEnabled !== false} onChange={(e) => set({ conversionSettings: { ...conversion, floatingCallEnabled: e.target.checked } })} />
              <span className="text-sm">Enable Floating Call Button</span>
            </label>
            <p className="text-xs text-charcoal/50">Phone and WhatsApp numbers are configured in the Contact tab.</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={conversion.portfolioCtaEnabled !== false} onChange={(e) => set({ conversionSettings: { ...conversion, portfolioCtaEnabled: e.target.checked } })} />
              <span className="text-sm">Enable Portfolio CTA Sections</span>
            </label>
            <Input value={String(conversion.portfolioCtaLabel || 'Book This Look')} onChange={(e) => set({ conversionSettings: { ...conversion, portfolioCtaLabel: e.target.value } })} placeholder="Portfolio CTA Label" />
          </CardContent>
        </Card>
      )}

      {tab === 'analytics' && (
        <Card>
          <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(['googleAnalyticsId', 'googleTagManagerId', 'facebookPixelId'] as const).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-charcoal/70">{key}</label>
                <Input value={analytics[key] || ''} onChange={(e) => set({ analyticsIds: { ...analytics, [key]: e.target.value } })} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'seo' && (
        <Card>
          <CardHeader><CardTitle>Default SEO</CardTitle></CardHeader>
          <CardContent>
            <SeoFields
              value={snapshotToSeoForm(form.seoDefaults as Record<string, unknown>)}
              onChange={(seoDefaults) => set({ seoDefaults: seoFormToSnapshot(seoDefaults) })}
            />
          </CardContent>
        </Card>
      )}

      {tab === 'branding' && (
        <Card>
          <CardHeader><CardTitle>Logo &amp; Favicon</CardTitle></CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <ImageField label="Site Logo" image={branding.logo ?? (form.logo as CloudinaryImageInput)} onChange={(v) => setBranding('logo', v)} folder="branding" />
            <ImageField label="Dark Logo (footer/header dark bg)" image={branding.darkLogo} onChange={(v) => setBranding('darkLogo', v)} folder="branding" />
            <ImageField label="Mobile Logo" image={branding.mobileLogo} onChange={(v) => setBranding('mobileLogo', v)} folder="branding" />
            <ImageField label="Favicon (browser tab)" image={branding.favicon} onChange={(v) => setBranding('favicon', v)} folder="branding" />
            <ImageField label="Apple Touch Icon (180×180)" image={branding.appleTouchIcon} onChange={(v) => setBranding('appleTouchIcon', v)} folder="branding" />
            <p className="text-xs text-charcoal/50 sm:col-span-2">Images upload to Cloudinary and update the public site automatically after save. Use square PNG for favicon.</p>
          </CardContent>
        </Card>
      )}

      {tab === 'brand' && (
        <Card>
          <CardHeader><CardTitle>Brand Colors</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {(['charcoal', 'gold', 'ivory'] as const).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium capitalize text-charcoal/70">{key}</label>
                <div className="flex gap-2">
                  <input type="color" value={brand[key] || '#000000'} onChange={(e) => set({ brandColors: { ...brand, [key]: e.target.value } })} className="h-10 w-12 cursor-pointer rounded border" />
                  <Input value={brand[key] || ''} onChange={(e) => set({ brandColors: { ...brand, [key]: e.target.value } })} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'cloudinary' && (
        <Card>
          <CardHeader><CardTitle>Cloudinary Delivery</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Quality Preset</label>
              <Input value={cloudinary.quality || 'auto:best'} onChange={(e) => set({ cloudinarySettings: { ...cloudinary, quality: e.target.value } })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal/70">Format</label>
              <Input value={cloudinary.format || 'auto'} onChange={(e) => set({ cloudinarySettings: { ...cloudinary, format: e.target.value } })} />
            </div>
            <p className="text-xs text-charcoal/50 sm:col-span-2">Cloudinary credentials are configured via server environment variables.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
