import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { queryKeys } from '@sk-makeup/shared';
import { Edit2 } from 'lucide-react';
import { ContentListPage, StatusBadge } from '@/components/content/ContentListPage';
import { useCrudList } from '@/hooks/useMedia';
import { galleryApi } from '@/lib/api';
import { canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@sk-makeup/shared';
import { Button } from '@/components/ui/button';

export function GalleryPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const { data, isLoading } = useCrudList(queryKeys.gallery.all, galleryApi.list, { search: search || undefined });

  const items = (data?.items || []) as Array<{ id: string; title: string; category: string; featured: boolean; isPublished: boolean; images?: unknown[] }>;

  return (
    <ContentListPage
      title="Gallery Albums"
      description="Curated image collections and lookbooks"
      items={items}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      canCreate={canManageContent(role)}
      onCreate={() => navigate('/gallery/new/edit')}
      columns={[
        { key: 'title', header: 'Album', render: (i) => <span className="font-medium">{i.title}</span> },
        { key: 'category', header: 'Category', render: (i) => i.category },
        { key: 'images', header: 'Images', render: (i) => i.images?.length ?? 0 },
        { key: 'status', header: 'Status', render: (i) => <StatusBadge published={i.isPublished} featured={i.featured} /> },
        {
          key: 'actions',
          header: '',
          render: (i) => canManageContent(role) ? (
            <Link to={`/gallery/${i.id}/edit`}>
              <Button size="sm" variant="ghost" className="gap-1"><Edit2 className="h-3 w-3" /> Edit</Button>
            </Link>
          ) : null,
        },
      ]}
    />
  );
}
