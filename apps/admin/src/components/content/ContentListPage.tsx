import { ReactNode } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

interface ContentListPageProps<T extends { id: string }> {
  title: string;
  description?: string;
  items: T[];
  columns: Column<T>[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onCreate?: () => void;
  canCreate?: boolean;
  emptyMessage?: string;
}

export function ContentListPage<T extends { id: string }>({
  title,
  description,
  items,
  columns,
  isLoading,
  search,
  onSearchChange,
  onCreate,
  canCreate,
  emptyMessage = 'No items found',
}: ContentListPageProps<T>) {
  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-charcoal/60">{description}</p>}
        </div>
        {canCreate && onCreate && (
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Create New
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
        <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search..." className="pl-9" />
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-charcoal/50">{emptyMessage}</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal-light/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-charcoal-light/10 bg-ivory-dark/50">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left font-medium text-charcoal/70">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-charcoal-light/5 hover:bg-ivory-dark/30 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">{col.render(item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ published, featured }: { published?: boolean; featured?: boolean }) {
  return (
    <div className="flex gap-1">
      {published !== undefined && (
        <Badge variant={published ? 'success' : 'outline'}>{published ? 'Published' : 'Draft'}</Badge>
      )}
      {featured && <Badge variant="default">Featured</Badge>}
    </div>
  );
}
