import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format } from 'date-fns';
import { publicBookingSchema, type PublicBookingInput } from '@sk-makeup/shared';
import { Container, Section } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { SeoHead } from '@/components/seo/seo-head';
import { useServices, usePackages, useAvailableSlots, useSubmitBooking, useSeo, useSiteSettings } from '@/hooks/use-public-api';
import { getErrorMessage } from '@/lib/axios';
import { formatPrice } from '@/lib/utils';

const STEPS = ['Service', 'Date', 'Time', 'Details', 'Review'] as const;

export function BookingPage() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<string | null>(null);
  const { data: servicesData } = useServices({ limit: 50 });
  const { data: packages } = usePackages();
  const { data: seo } = useSeo('book');
  const { data: settings } = useSiteSettings();
  const submitBooking = useSubmitBooking();

  const form = useForm<PublicBookingInput>({
    resolver: zodResolver(publicBookingSchema),
    defaultValues: { website: '' },
  });

  const selectedDate = form.watch('bookingDate');
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(selectedDate ?? '');

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await submitBooking.mutateAsync(data);
      setSuccess(result.bookingNumber);
    } catch (err) {
      form.setError('root', { message: getErrorMessage(err) });
    }
  });

  const minAdvance = settings?.bookingSettings?.minAdvanceDays ?? 1;
  const maxAdvance = settings?.bookingSettings?.maxAdvanceDays ?? 90;
  const minDate = format(addDays(new Date(), minAdvance), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), maxAdvance), 'yyyy-MM-dd');

  if (success) {
    return (
      <Section>
        <Container className="py-24 text-center">
          <SeoHead page="book" seo={seo} title="Booking Confirmed" />
          <FadeIn>
            <p className="luxury-subheading">Thank You</p>
            <h1 className="mt-4 font-serif text-4xl">Booking Confirmed</h1>
            <p className="mt-4 text-charcoal/70">Your booking reference is <strong className="text-gold">{success}</strong></p>
            <p className="mt-2 text-sm text-charcoal/50">
              {settings?.bookingSettings?.confirmationMessage || 'We will contact you shortly to confirm your appointment.'}
            </p>
          </FadeIn>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <SeoHead page="book" seo={seo} title="Book a Session | SK Makeup Artist" />

      <Section className="bg-charcoal pt-4">
        <Container className="py-16 text-center md:py-20">
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">Book Your Session</h1>
          <p className="mt-4 text-ivory/60">Reserve your luxury makeup experience</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-2xl">
            <nav aria-label="Booking progress" className="mb-10">
              <ol className="flex justify-between gap-2">
                {STEPS.map((label, i) => {
                  const s = i + 1;
                  return (
                    <li key={label} className="flex flex-1 flex-col items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${step >= s ? 'bg-gold text-charcoal' : 'bg-charcoal/10 text-charcoal/40'}`} aria-current={step === s ? 'step' : undefined}>
                        {s}
                      </span>
                      <span className={`hidden text-xs uppercase tracking-wider sm:block ${step >= s ? 'text-charcoal' : 'text-charcoal/40'}`}>{label}</span>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <form onSubmit={onSubmit} className="space-y-6">
              <input type="text" {...form.register('website')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

              {step === 1 && (
                <FadeIn>
                  <h2 className="mb-6 font-serif text-2xl">Select Service or Package</h2>
                  <Select
                    label="Service"
                    id="selectedService"
                    {...form.register('selectedService')}
                    onChange={(e) => {
                      form.setValue('selectedService', e.target.value || undefined);
                      form.setValue('selectedPackage', undefined);
                    }}
                  >
                    <option value="">Choose a service...</option>
                    {servicesData?.items.map((s) => (
                      <option key={s._id} value={s._id}>{s.title} — From {formatPrice(s.startingPrice, s.currency)}</option>
                    ))}
                  </Select>
                  <div className="my-4 text-center text-xs uppercase tracking-wider text-charcoal/40">or</div>
                  <Select
                    label="Package"
                    id="selectedPackage"
                    {...form.register('selectedPackage')}
                    onChange={(e) => {
                      form.setValue('selectedPackage', e.target.value || undefined);
                      form.setValue('selectedService', undefined);
                    }}
                  >
                    <option value="">Choose a package...</option>
                    {packages?.map((p) => (
                      <option key={p._id} value={p._id}>{p.title} — {formatPrice(p.packagePrice, p.currency)}</option>
                    ))}
                  </Select>
                  <Button type="button" className="mt-6 w-full" onClick={() => {
                    if (form.getValues('selectedService') || form.getValues('selectedPackage')) setStep(2);
                    else form.setError('selectedService', { message: 'Please select a service or package' });
                  }}>
                    Continue
                  </Button>
                </FadeIn>
              )}

              {step === 2 && (
                <FadeIn>
                  <h2 className="mb-6 font-serif text-2xl">Choose Date</h2>
                  <Input
                    label="Preferred Date"
                    id="bookingDate"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    {...form.register('bookingDate')}
                    error={form.formState.errors.bookingDate?.message}
                  />
                  <div className="mt-6 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" onClick={() => form.getValues('bookingDate') && setStep(3)}>Continue</Button>
                  </div>
                </FadeIn>
              )}

              {step === 3 && (
                <FadeIn>
                  <h2 className="mb-6 font-serif text-2xl">Choose Time</h2>
                  {slotsLoading ? (
                    <p className="text-charcoal/50">Loading available slots...</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {slotsData?.slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => form.setValue('bookingTime', slot.startTime)}
                          className={`border px-3 py-3 text-sm transition ${
                            form.watch('bookingTime') === slot.startTime
                              ? 'border-gold bg-gold/10 text-gold-dark'
                              : slot.available
                                ? 'border-charcoal/15 hover:border-gold/40'
                                : 'cursor-not-allowed border-charcoal/5 text-charcoal/30 line-through'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button type="button" onClick={() => form.getValues('bookingTime') && setStep(4)}>Continue</Button>
                  </div>
                </FadeIn>
              )}

              {step === 4 && (
                <FadeIn>
                  <h2 className="mb-6 font-serif text-2xl">Your Details</h2>
                  <div className="space-y-4">
                    <Input label="Full Name" id="customerName" {...form.register('customerName')} error={form.formState.errors.customerName?.message} />
                    <Input label="Email" id="customerEmail" type="email" {...form.register('customerEmail')} error={form.formState.errors.customerEmail?.message} />
                    <Input label="Phone" id="customerPhone" type="tel" {...form.register('customerPhone')} error={form.formState.errors.customerPhone?.message} />
                    <Textarea label="Notes (optional)" id="notes" {...form.register('notes')} />
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button type="button" onClick={() => {
                      void form.trigger(['customerName', 'customerEmail', 'customerPhone']).then((ok) => ok && setStep(5));
                    }}>Review Booking</Button>
                  </div>
                </FadeIn>
              )}

              {step === 5 && (
                <FadeIn>
                  <h2 className="mb-6 font-serif text-2xl">Review Your Booking</h2>
                  <dl className="space-y-3 rounded-lg border border-charcoal/10 bg-white p-6 text-sm">
                    <div className="flex justify-between border-b border-charcoal/5 pb-2">
                      <dt className="text-charcoal/50">Service / Package</dt>
                      <dd className="font-medium">
                        {servicesData?.items.find((s) => s._id === form.getValues('selectedService'))?.title
                          || packages?.find((p) => p._id === form.getValues('selectedPackage'))?.title}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-charcoal/5 pb-2">
                      <dt className="text-charcoal/50">Date</dt>
                      <dd className="font-medium">{form.getValues('bookingDate')}</dd>
                    </div>
                    <div className="flex justify-between border-b border-charcoal/5 pb-2">
                      <dt className="text-charcoal/50">Time</dt>
                      <dd className="font-medium">{form.getValues('bookingTime')}</dd>
                    </div>
                    <div className="flex justify-between border-b border-charcoal/5 pb-2">
                      <dt className="text-charcoal/50">Name</dt>
                      <dd className="font-medium">{form.getValues('customerName')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal/50">Email</dt>
                      <dd className="font-medium">{form.getValues('customerEmail')}</dd>
                    </div>
                  </dl>
                  {form.formState.errors.root && (
                    <p className="mt-4 text-sm text-red-600" role="alert">{form.formState.errors.root.message}</p>
                  )}
                  <div className="mt-6 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(4)}>Back</Button>
                    <Button type="submit" disabled={submitBooking.isPending} className="flex-1">
                      {submitBooking.isPending ? 'Submitting...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </FadeIn>
              )}
            </form>
          </div>
        </Container>
      </Section>
    </>
  );
}
