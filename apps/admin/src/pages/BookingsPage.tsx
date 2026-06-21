import { useState } from 'react';
import { queryKeys } from '@sk-makeup/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, availabilityApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

export function BookingsPage() {
  const queryClient = useQueryClient();
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: queryKeys.bookings.list({}),
    queryFn: async () => {
      const { data } = await bookingsApi.list();
      return data.data as Array<{ id: string; bookingNumber: string; customerName: string; bookingDate: string; bookingTime: string; status: string }>;
    },
  });

  const { data: slots } = useQuery({
    queryKey: queryKeys.availability.slots(slotDate),
    queryFn: async () => {
      const { data } = await availabilityApi.getSlots(slotDate);
      return data.data as { date: string; slots: Array<{ startTime: string; endTime: string; available: boolean; remaining: number }>; available: boolean };
    },
    enabled: !!slotDate,
  });

  const { data: weekly } = useQuery({
    queryKey: queryKeys.availability.weekly,
    queryFn: async () => {
      const { data } = await availabilityApi.getWeekly();
      return data.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bookings?.length ? bookings.map((b) => (
              <div key={b.id} className="rounded-lg border border-charcoal-light/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{b.customerName}</p>
                    <p className="text-xs text-charcoal/50">{b.bookingNumber}</p>
                    <p className="mt-1 text-sm">{new Date(b.bookingDate).toLocaleDateString()} at {b.bookingTime}</p>
                  </div>
                  <Badge variant={b.status === 'pending' ? 'warning' : b.status === 'confirmed' ? 'success' : 'outline'}>{b.status}</Badge>
                </div>
                {b.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => updateStatus.mutate({ id: b.id, status: 'confirmed' })}>Confirm</Button>
                    <Button size="sm" variant="secondary" onClick={() => updateStatus.mutate({ id: b.id, status: 'rejected' })}>Reject</Button>
                  </div>
                )}
              </div>
            )) : <p className="text-sm text-charcoal/50">No bookings yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Availability Check</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
            {slots?.slots?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {slots.slots.map((slot) => (
                  <div
                    key={slot.startTime}
                    className={`rounded-lg border px-3 py-2 text-center text-sm ${slot.available ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50 opacity-60'}`}
                  >
                    <p className="font-medium">{slot.startTime}</p>
                    <p className="text-xs">{slot.remaining} left</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/50">{slots?.available === false ? 'No availability' : 'Configure weekly availability below'}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
        <CardContent>
          {Array.isArray(weekly) && weekly.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(weekly as Array<{ dayOfWeek: number; slots: Array<{ startTime: string; endTime: string }> }>).map((day) => (
                <div key={day.dayOfWeek} className="rounded-lg border border-charcoal-light/10 p-3">
                  <p className="font-medium">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.dayOfWeek]}</p>
                  {day.slots?.map((s) => (
                    <p key={s.startTime} className="text-xs text-charcoal/60">{s.startTime} – {s.endTime}</p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/50">No weekly availability configured. Use the API or settings to configure time slots.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
