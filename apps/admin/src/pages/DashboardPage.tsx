import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@sk-makeup/shared';
import { Briefcase, Camera, Calendar, Image } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data: res } = await dashboardApi.stats();
      return res.data as {
        counts: { services: number; portfolio: number; gallery: number; pendingBookings: number; media: number; newLeads: number };
        recentBookings: Array<{ customerName: string; status: string; bookingDate: string }>;
      };
    },
  });

  if (isLoading) return <PageLoader />;

  const counts = data?.counts;

  const stats = [
    { label: 'Services', value: counts?.services ?? 0, icon: Briefcase },
    { label: 'Portfolio', value: counts?.portfolio ?? 0, icon: Camera },
    { label: 'Media Assets', value: counts?.media ?? 0, icon: Image },
    { label: 'Pending Bookings', value: counts?.pendingBookings ?? 0, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-charcoal/60">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentBookings?.length ? (
            <div className="space-y-3">
              {data.recentBookings.map((booking, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-charcoal-light/10 px-4 py-3">
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-xs text-charcoal/50">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={booking.status === 'pending' ? 'warning' : 'success'}>{booking.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/50">No recent bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
