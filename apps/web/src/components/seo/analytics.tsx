import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getEnv } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-public-api';

export function Analytics() {
  const { data: settings } = useSiteSettings();
  const envGaId = getEnv('VITE_GOOGLE_ANALYTICS_ID', '');
  const gaId = settings?.analyticsIds?.googleAnalyticsId || envGaId;
  const gtmId = settings?.analyticsIds?.googleTagManagerId;
  const fbPixelId = settings?.analyticsIds?.facebookPixelId;

  useEffect(() => {
    if (!gaId || typeof window === 'undefined') return;

    const scriptId = 'ga4-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }
    gtag('js', new Date());
    gtag('config', gaId);
  }, [gaId]);

  return (
    <Helmet>
      {gtmId && (
        <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}</script>
      )}
      {fbPixelId && (
        <script>{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${fbPixelId}');fbq('track','PageView');`}</script>
      )}
    </Helmet>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
