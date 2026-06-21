/** Fields safe to expose on public site-settings endpoint. */
export function toPublicSiteSettings(doc: Record<string, unknown>) {
  return {
    siteName: doc.siteName,
    tagline: doc.tagline,
    logo: doc.logo,
    brandingSettings: doc.brandingSettings,
    faviconNote: doc.faviconNote,
    contactDetails: doc.contactDetails,
    socialLinks: doc.socialLinks,
    businessHours: doc.businessHours,
    seoDefaults: doc.seoDefaults,
    maintenanceMode: doc.maintenanceMode,
    brandColors: doc.brandColors,
    bookingSettings: doc.bookingSettings,
    conversionSettings: doc.conversionSettings,
  };
}
