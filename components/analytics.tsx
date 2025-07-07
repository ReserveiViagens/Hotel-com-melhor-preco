'use client';

import Script from 'next/script';

interface AnalyticsProps {
  gaId: string;
}

export function GoogleAnalytics({ gaId }: AnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              'custom_parameter_1': 'user_type',
              'custom_parameter_2': 'subscription_level'
            }
          });
        `}
      </Script>
    </>
  );
}

// Hook para tracking de eventos
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: new Date().toISOString()
      });
    }
  };

  const trackPageView = (url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
        page_title: title || document.title
      });
    }
  };

  const trackConversion = (conversionId: string, conversionLabel: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${conversionId}/${conversionLabel}`,
        value: value,
        currency: 'BRL'
      });
    }
  };

  const trackUserEngagement = (engagementType: string, details: Record<string, any> = {}) => {
    trackEvent('user_engagement', {
      engagement_type: engagementType,
      ...details
    });
  };

  const trackBooking = (bookingData: {
    hotelId?: string;
    attractionId?: string;
    value: number;
    currency: string;
  }) => {
    trackEvent('booking_completed', {
      currency: bookingData.currency,
      value: bookingData.value,
      items: [
        {
          item_id: bookingData.hotelId || bookingData.attractionId,
          item_name: bookingData.hotelId ? 'Hotel Booking' : 'Attraction Booking',
          price: bookingData.value,
          quantity: 1
        }
      ]
    });
  };

  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  };

  const trackGamification = (action: string, points: number, level?: number) => {
    trackEvent('gamification_action', {
      action: action,
      points: points,
      level: level
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackUserEngagement,
    trackBooking,
    trackSearch,
    trackGamification
  };
}

// Componente para tracking automático de páginas
export function AnalyticsPageTracker() {
  const { trackPageView } = useAnalytics();

  React.useEffect(() => {
    trackPageView(window.location.pathname, document.title);
  }, []);

  return null;
}

// Declaração global para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 