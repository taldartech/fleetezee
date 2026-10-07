/**
 * FLEETEZEE — Centralized Conversion & Event Tracking Engine
 * Provides event dispatcher for Google Analytics 4, GTM, Meta Pixel, and CRM webhooks.
 */

window.FleetezeeAnalytics = (function () {
  'use strict';

  const trackedScrollDepths = new Set();

  function track(eventName, params = {}) {
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      ...params
    };

    // 1. Google Tag Manager / GA4 DataLayer
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }

    // 2. Direct gtag support
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // Debug logging in non-production environments
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[Fleetezee Analytics] Event Tracked: ${eventName}`, payload);
    }
  }

  // Auto-track scroll depth
  function initScrollDepthTracking() {
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);
      const thresholds = [25, 50, 75, 90];

      thresholds.forEach((thresh) => {
        if (scrollPercentage >= thresh && !trackedScrollDepths.has(thresh)) {
          trackedScrollDepths.add(thresh);
          track('scroll_depth', { depth_percentage: thresh });
        }
      });
    }, { passive: true });
  }

  // Auto-track outbound WhatsApp & Phone calls
  function initContactLinks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      if (href.startsWith('https://wa.me/') || href.includes('api.whatsapp.com')) {
        track('whatsapp_click', {
          source: target.dataset.analyticsSource || 'generic_link'
        });
      } else if (href.startsWith('tel:')) {
        track('phone_call_click', {
          phone_number: href.replace('tel:', ''),
          source: target.dataset.analyticsSource || 'generic_link'
        });
      }
    });
  }

  // DOM ready init
  document.addEventListener('DOMContentLoaded', () => {
    initScrollDepthTracking();
    initContactLinks();
  });

  return {
    track: track
  };
})();
