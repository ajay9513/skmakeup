import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { publicContactSchema, type PublicContactInput } from '@sk-makeup/shared';
import { Container, Section } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SeoHead } from '@/components/seo/seo-head';
import { usePageContent, useSeo, useSiteSettings, useSubmitContact } from '@/hooks/use-public-api';
import { getContentText } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { getEnv } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function ContactPage() {
  const { data: settings } = useSiteSettings();
  const { data: contentData } = usePageContent('contact');
  const { data: globalContent } = usePageContent('global');
  const { data: seo } = useSeo('contact');
  const submitContact = useSubmitContact();

  const content = contentData?.content ?? {};
  const global = globalContent?.content ?? {};
  const headline = getContentText(content, 'contact.intro.headline');
  const description = getContentText(content, 'contact.intro.description');

  const contact = settings?.contactDetails;
  const whatsapp = contact?.whatsappNumber || getEnv('VITE_WHATSAPP_NUMBER');
  const hours = settings?.businessHours ?? {};

  const form = useForm<PublicContactInput>({
    resolver: zodResolver(publicContactSchema),
    defaultValues: { website: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await submitContact.mutateAsync(data);
      form.reset();
      form.clearErrors();
      alert('Thank you! Your message has been sent.');
    } catch (err) {
      form.setError('root', { message: getErrorMessage(err) });
    }
  });

  return (
    <>
      <SeoHead page="contact" seo={seo} />

      <Section className="bg-charcoal pt-4">
        <Container className="py-16 text-center md:py-20">
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">{headline || 'Get In Touch'}</h1>
          {description && <p className="mt-4 text-ivory/60">{description}</p>}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-2">
            <FadeIn>
              <h2 className="font-serif text-2xl">Contact Information</h2>
              <ul className="mt-8 space-y-6">
                {contact?.phone && (
                  <li className="flex items-start gap-4">
                    <Phone className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-charcoal/50">Phone</p>
                      <a href={`tel:${contact.phone}`} className="text-lg hover:text-gold">{contact.phone}</a>
                    </div>
                  </li>
                )}
                {contact?.email && (
                  <li className="flex items-start gap-4">
                    <Mail className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-charcoal/50">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-lg hover:text-gold">{contact.email}</a>
                    </div>
                  </li>
                )}
                {whatsapp && (
                  <li className="flex items-start gap-4">
                    <MessageCircle className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-charcoal/50">WhatsApp</p>
                      <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-lg hover:text-gold">{whatsapp}</a>
                    </div>
                  </li>
                )}
                {(contact?.address || getContentText(global, 'global.business.address')) && (
                  <li className="flex items-start gap-4">
                    <MapPin className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-charcoal/50">Address</p>
                      <p className="text-lg">{contact?.address || getContentText(global, 'global.business.address')}</p>
                    </div>
                  </li>
                )}
              </ul>

              {Object.keys(hours).length > 0 && (
                <div className="mt-10">
                  <h3 className="flex items-center gap-2 font-serif text-xl">
                    <Clock className="h-5 w-5 text-gold" /> Business Hours
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-charcoal/70">
                    {DAYS.map((day) => {
                      const h = hours[day];
                      if (!h) return null;
                      return (
                        <li key={day} className="flex justify-between border-b border-charcoal/5 pb-2 capitalize">
                          <span>{day}</span>
                          <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="font-serif text-2xl">Send a Message</h2>
              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <input type="text" {...form.register('website')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
                <Input label="Name" id="name" {...form.register('name')} error={form.formState.errors.name?.message} />
                <Input label="Email" id="email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
                <Input label="Phone (optional)" id="phone" type="tel" {...form.register('phone')} />
                <Input label="Subject" id="subject" {...form.register('subject')} error={form.formState.errors.subject?.message} />
                <Textarea label="Message" id="message" {...form.register('message')} error={form.formState.errors.message?.message} />
                {form.formState.errors.root && (
                  <p className="text-sm text-red-600" role="alert">{form.formState.errors.root.message}</p>
                )}
                <Button type="submit" disabled={submitContact.isPending} className="w-full">
                  {submitContact.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </FadeIn>
          </div>
        </Container>
      </Section>
    </>
  );
}
