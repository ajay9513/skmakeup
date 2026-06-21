export interface CmsFieldDef {
  key: string;
  label: string;
  section: string;
  type: 'text' | 'richtext' | 'image';
  order?: number;
  defaultValue?: string;
}

export const CMS_PAGE_DEFINITIONS: Record<string, CmsFieldDef[]> = {
  homepage: [
    { key: 'homepage.hero.headline', label: 'Hero Headline', section: 'hero', type: 'text', order: 1 },
    { key: 'homepage.hero.subheadline', label: 'Hero Subheadline', section: 'hero', type: 'text', order: 2 },
    { key: 'homepage.hero.backgroundImage', label: 'Hero Background Image', section: 'hero', type: 'image', order: 3 },
    { key: 'homepage.hero.ctaLabel', label: 'Hero CTA Label', section: 'hero', type: 'text', order: 4 },
    { key: 'homepage.hero.ctaHref', label: 'Hero CTA Link', section: 'hero', type: 'text', order: 5 },
    { key: 'homepage.stats.experience', label: 'Years Experience', section: 'stats', type: 'text', order: 1 },
    { key: 'homepage.stats.clients', label: 'Happy Clients', section: 'stats', type: 'text', order: 2 },
    { key: 'homepage.stats.events', label: 'Events', section: 'stats', type: 'text', order: 3 },
    { key: 'homepage.stats.awards', label: 'Awards', section: 'stats', type: 'text', order: 4 },
    { key: 'homepage.intro.title', label: 'Intro Title', section: 'intro', type: 'text', order: 1 },
    { key: 'homepage.intro.body', label: 'Intro Body', section: 'intro', type: 'richtext', order: 2 },
    { key: 'homepage.cta.title', label: 'Footer CTA Title', section: 'cta', type: 'text', order: 1 },
    { key: 'homepage.cta.buttonLabel', label: 'Footer CTA Button', section: 'cta', type: 'text', order: 2 },
  ],
  about: [
    { key: 'about.intro.headline', label: 'Headline', section: 'intro', type: 'text' },
    { key: 'about.intro.story', label: 'Story', section: 'intro', type: 'richtext' },
    { key: 'about.experience.body', label: 'Experience', section: 'experience', type: 'richtext' },
    { key: 'about.mission.body', label: 'Mission', section: 'mission', type: 'richtext' },
    { key: 'about.awards.body', label: 'Awards', section: 'awards', type: 'richtext' },
  ],
  contact: [
    { key: 'contact.intro.headline', label: 'Headline', section: 'intro', type: 'text' },
    { key: 'contact.intro.description', label: 'Description', section: 'intro', type: 'text' },
  ],
  global: [
    { key: 'global.footer.tagline', label: 'Footer Tagline', section: 'footer', type: 'text' },
    { key: 'global.footer.copyright', label: 'Copyright', section: 'footer', type: 'text' },
    { key: 'global.footer.link1.label', label: 'Link 1 Label', section: 'footer', type: 'text' },
    { key: 'global.footer.link1.href', label: 'Link 1 URL', section: 'footer', type: 'text' },
    { key: 'global.footer.link2.label', label: 'Link 2 Label', section: 'footer', type: 'text' },
    { key: 'global.footer.link2.href', label: 'Link 2 URL', section: 'footer', type: 'text' },
    { key: 'global.footer.link3.label', label: 'Link 3 Label', section: 'footer', type: 'text' },
    { key: 'global.footer.link3.href', label: 'Link 3 URL', section: 'footer', type: 'text' },
    { key: 'global.footer.link4.label', label: 'Link 4 Label', section: 'footer', type: 'text' },
    { key: 'global.footer.link4.href', label: 'Link 4 URL', section: 'footer', type: 'text' },
    { key: 'global.business.address', label: 'Business Address', section: 'business_info', type: 'text' },
  ],
};
