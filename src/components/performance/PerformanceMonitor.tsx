'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {};
    
    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          reportMetric('FCP', entry.startTime);
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
      reportMetric('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.fid = (entry as any).processingStart - entry.startTime;
        reportMetric('FID', metrics.fid);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metrics.cls = clsValue;
      reportMetric('CLS', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte (TTFB)
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        reportMetric('TTFB', metrics.ttfb);
      }
    });
    navObserver.observe({ entryTypes: ['navigation'] });

    // Clean up observers on unmount
    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      navObserver.disconnect();
    };
  }, []);

  const reportMetric = (name: string, value: number) => {
    // Only report in production and if analytics is enabled
    if (process.env.NODE_ENV !== 'production') return;
    
    // Report to analytics service (PostHog, Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        custom_map: { metric_name: name }
      });
    }

    // Report to PostHog if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('web_vitals', {
        metric_name: name,
        value: Math.round(value),
        page_path: window.location.pathname,
      });
    }

    // Console logging for development
    console.log(`[Performance] ${name}: ${Math.round(value)}ms`);
  };

  return null; // This component doesn't render anything
}