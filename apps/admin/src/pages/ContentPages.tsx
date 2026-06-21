import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { queryKeys } from '@sk-makeup/shared';
import { Edit2 } from 'lucide-react';
import { ContentListPage, StatusBadge } from '@/components/content/ContentListPage';
import { useCrudList } from '@/hooks/useMedia';
import { testimonialsApi, teamMembersApi } from '@/lib/api';
import { canManageContent } from '@/lib/rbac';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@sk-makeup/shared';
import { Button } from '@/components/ui/button';

export function TestimonialsPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const { data, isLoading } = useCrudList(queryKeys.testimonials.all, testimonialsApi.list, { search: search || undefined });
  const items = (data?.items || []) as Array<{ id: string; clientName: string; rating: number; isPublished: boolean; isFeatured: boolean }>;

  return (
    <ContentListPage
      title="Testimonials"
      description="Client reviews and feedback"
      items={items}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      canCreate={canManageContent(role)}
      onCreate={() => navigate('/testimonials/new/edit')}
      columns={[
        { key: 'name', header: 'Client', render: (i) => i.clientName },
        { key: 'rating', header: 'Rating', render: (i) => `${'★'.repeat(i.rating)}${'☆'.repeat(5 - i.rating)}` },
        { key: 'status', header: 'Status', render: (i) => <StatusBadge published={i.isPublished} featured={i.isFeatured} /> },
        {
          key: 'actions',
          header: '',
          render: (i) => canManageContent(role) ? (
            <Link to={`/testimonials/${i.id}/edit`}>
              <Button size="sm" variant="ghost" className="gap-1"><Edit2 className="h-3 w-3" /> Edit</Button>
            </Link>
          ) : null,
        },
      ]}
    />
  );
}

export function TeamPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;
  const { data, isLoading } = useCrudList(queryKeys.teamMembers.all, teamMembersApi.list, { search: search || undefined });
  const items = (data?.items || []) as Array<{ id: string; name: string; designation: string; isPublished: boolean; isFeatured: boolean }>;

  return (
    <ContentListPage
      title="Team Members"
      description="Your makeup artistry team"
      items={items}
      isLoading={isLoading}
      search={search}
      onSearchChange={setSearch}
      canCreate={canManageContent(role)}
      onCreate={() => navigate('/team/new/edit')}
      columns={[
        { key: 'name', header: 'Name', render: (i) => <span className="font-medium">{i.name}</span> },
        { key: 'role', header: 'Designation', render: (i) => i.designation },
        { key: 'status', header: 'Status', render: (i) => <StatusBadge published={i.isPublished} featured={i.isFeatured} /> },
        {
          key: 'actions',
          header: '',
          render: (i) => canManageContent(role) ? (
            <Link to={`/team/${i.id}/edit`}>
              <Button size="sm" variant="ghost" className="gap-1"><Edit2 className="h-3 w-3" /> Edit</Button>
            </Link>
          ) : null,
        },
      ]}
    />
  );
}
