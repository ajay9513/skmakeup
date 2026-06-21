import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { queryKeys } from '@sk-makeup/shared';
import { Edit2 } from 'lucide-react';
import { ContentListPage, StatusBadge } from '@/components/content/ContentListPage';
import { useCrudList } from '@/hooks/useMedia';
import { portfolioApi } from '@/lib/api';
import { canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@sk-makeup/shared';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';

export function PortfolioPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const { data, isLoading } = useCrudList(queryKeys.portfolio.all, portfolioApi.list, { search: search || undefined });

  const items = (data?.items || []) as Array<{
    id: string; title: string; category: string; featured: boolean; published: boolean;
    featuredImage?: { publicId: string }; viewCount: number; scheduledPublishAt?: string;
  }>;

  return (
    <ContentListPage
      title="Portfolio"
      description="Showcase your finest makeup artistry — before & after, gallery images"
      items={items}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      canCreate={canManageContent(role)}
      onCreate={() => navigate('/portfolio/new/edit')}
      columns={[
        {
          key: 'image',
          header: '',
          render: (i) => i.featuredImage?.publicId ? (
            <img src={getCloudinaryImageUrl(i.featuredImage.publicId, 'adminGrid')} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : null,
        },
        { key: 'title', header: 'Title', render: (i) => <span className="font-medium">{i.title}</span> },
        { key: 'category', header: 'Category', render: (i) => i.category },
        { key: 'views', header: 'Views', render: (i) => i.viewCount ?? 0 },
        {
          key: 'status',
          header: 'Status',
          render: (i) => (
            <div className="flex flex-col gap-1">
              <StatusBadge published={i.published} featured={i.featured} />
              {!i.published && i.scheduledPublishAt && (
                <span className="text-xs text-charcoal/50">Scheduled</span>
              )}
            </div>
          ),
        },
        {
          key: 'actions',
          header: '',
          render: (i) => canManageContent(role) ? (
            <Link to={`/portfolio/${i.id}/edit`}>
              <Button size="sm" variant="ghost" className="gap-1"><Edit2 className="h-3 w-3" /> Edit</Button>
            </Link>
          ) : null,
        },
      ]}
    />
  );
}
