export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  media: {
    all: ['media'] as const,
    list: (params: Record<string, unknown>) => ['media', 'list', params] as const,
    detail: (id: string) => ['media', 'detail', id] as const,
  },
  services: {
    all: ['services'] as const,
    list: (params: Record<string, unknown>) => ['services', 'list', params] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
  },
  portfolio: {
    all: ['portfolio'] as const,
    list: (params: Record<string, unknown>) => ['portfolio', 'list', params] as const,
    detail: (id: string) => ['portfolio', 'detail', id] as const,
  },
  gallery: {
    all: ['gallery'] as const,
    list: (params: Record<string, unknown>) => ['gallery', 'list', params] as const,
    detail: (id: string) => ['gallery', 'detail', id] as const,
  },
  testimonials: {
    all: ['testimonials'] as const,
    list: (params: Record<string, unknown>) => ['testimonials', 'list', params] as const,
    detail: (id: string) => ['testimonials', 'detail', id] as const,
  },
  teamMembers: {
    all: ['team-members'] as const,
    list: (params: Record<string, unknown>) => ['team-members', 'list', params] as const,
    detail: (id: string) => ['team-members', 'detail', id] as const,
  },
  websiteContent: {
    all: ['website-content'] as const,
    list: (params: Record<string, unknown>) => ['website-content', 'list', params] as const,
    byPage: (page: string) => ['website-content', 'page', page] as const,
  },
  seo: {
    all: ['seo'] as const,
    list: (params: Record<string, unknown>) => ['seo', 'list', params] as const,
    detail: (id: string) => ['seo', 'detail', id] as const,
  },
  settings: {
    site: ['settings', 'site'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params: Record<string, unknown>) => ['bookings', 'list', params] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  availability: {
    weekly: ['availability', 'weekly'] as const,
    blocked: ['availability', 'blocked'] as const,
    slots: (date: string) => ['availability', 'slots', date] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  public: {
    settings: ['public', 'settings'] as const,
    content: (page: string) => ['public', 'content', page] as const,
    services: (params?: Record<string, unknown>) => ['public', 'services', params ?? {}] as const,
    service: (slug: string) => ['public', 'services', slug] as const,
    packages: ['public', 'packages'] as const,
    portfolio: (params?: Record<string, unknown>) => ['public', 'portfolio', params ?? {}] as const,
    portfolioItem: (slug: string) => ['public', 'portfolio', slug] as const,
    gallery: (params?: Record<string, unknown>) => ['public', 'gallery', params ?? {}] as const,
    testimonials: ['public', 'testimonials'] as const,
    team: ['public', 'team'] as const,
    seo: (page: string) => ['public', 'seo', page] as const,
    slots: (date: string) => ['public', 'slots', date] as const,
  },
} as const;
