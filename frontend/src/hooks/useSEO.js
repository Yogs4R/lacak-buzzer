import { useEffect } from 'react';

/**
 * useSEO — injects per-page JSON-LD structured data into <head>
 * and updates <link rel="canonical"> for GEO & SEO.
 *
 * @param {Object} options
 * @param {string} options.title      - Title for this page
 * @param {string} options.canonical  - Canonical URL for this page
 * @param {Object|Object[]} options.schema - JSON-LD schema object(s) to inject
 */
export function useSEO({ title, canonical, schema }) {
  useEffect(() => {
    // ── Title ────────────────────────────────────────────────────
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }

    // ── Canonical ────────────────────────────────────────────────
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl && canonical) {
      canonicalEl.setAttribute('href', canonical);
    }

    // ── JSON-LD ──────────────────────────────────────────────────
    if (!schema) return;

    const schemas = Array.isArray(schema) ? schema : [schema];
    const injected = [];

    schemas.forEach((s) => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-page-schema', 'true');
      el.textContent = JSON.stringify(s);
      document.head.appendChild(el);
      injected.push(el);
    });

    // Cleanup when route changes
    return () => {
      if (title) {
        document.title = 'Lacak Buzzer | Analisis Akun X/Twitter'; // Fallback default
      }
      injected.forEach((el) => el.remove());
      // Restore canonical to root when leaving a sub-page
      if (canonicalEl) {
        canonicalEl.setAttribute('href', 'https://lacakbuzzer.web.id/');
      }
    };
  }, [title, canonical, schema]);
}
