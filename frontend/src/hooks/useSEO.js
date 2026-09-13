import { useEffect } from 'react';

const DEFAULT_TITLE = 'Lacak Buzzer | Analisis Akun X/Twitter';
const DEFAULT_DESCRIPTION = 'Alat untuk menganalisis indikator risiko amplifikasi terkoordinasi pada akun X/Twitter.';
const DEFAULT_CANONICAL = 'https://lacakbuzzer.web.id/';
const DEFAULT_ROBOTS = 'index, follow';

/**
 * useSEO — injects per-page meta tags, canonical URL, and JSON-LD structured data into <head>
 * for GEO & SEO optimization.
 *
 * @param {Object} options
 * @param {string} [options.title]        - Title for this page
 * @param {string} [options.description]  - Meta description for this page
 * @param {string} [options.canonical]    - Canonical URL for this page
 * @param {Object|Object[]} [options.schema] - JSON-LD schema object(s) to inject
 * @param {boolean} [options.noIndex]     - Set true to prevent search engines from indexing this page (e.g. 404)
 */
export function useSEO({ title, description, canonical, schema, noIndex }) {
  useEffect(() => {
    // ── Title & Social Titles ────────────────────────────────────
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', title);
    }

    // ── Description ──────────────────────────────────────────────
    if (description) {
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', description);
    }

    // ── Canonical & Social URL ───────────────────────────────────
    if (canonical) {
      const canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) canonicalEl.setAttribute('href', canonical);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonical);
      const twitterUrl = document.querySelector('meta[name="twitter:url"]');
      if (twitterUrl) twitterUrl.setAttribute('content', canonical);
    }

    // ── Robots Directive (e.g. noindex for 404) ──────────────────
    if (noIndex) {
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.setAttribute('content', 'noindex, follow');
    }

    // ── JSON-LD ──────────────────────────────────────────────────
    const injected = [];
    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((s) => {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-page-schema', 'true');
        el.textContent = JSON.stringify(s);
        document.head.appendChild(el);
        injected.push(el);
      });
    }

    // ── Cleanup when unmounting / route changes ──────────────────
    return () => {
      if (title) {
        document.title = DEFAULT_TITLE;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', DEFAULT_TITLE);
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute('content', DEFAULT_TITLE);
      }

      if (description) {
        const descEl = document.querySelector('meta[name="description"]');
        if (descEl) descEl.setAttribute('content', DEFAULT_DESCRIPTION);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', DEFAULT_DESCRIPTION);
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc) twitterDesc.setAttribute('content', DEFAULT_DESCRIPTION);
      }

      if (canonical) {
        const canonicalEl = document.querySelector('link[rel="canonical"]');
        if (canonicalEl) canonicalEl.setAttribute('href', DEFAULT_CANONICAL);
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', DEFAULT_CANONICAL);
        const twitterUrl = document.querySelector('meta[name="twitter:url"]');
        if (twitterUrl) twitterUrl.setAttribute('content', DEFAULT_CANONICAL);
      }

      if (noIndex) {
        const robotsEl = document.querySelector('meta[name="robots"]');
        if (robotsEl) robotsEl.setAttribute('content', DEFAULT_ROBOTS);
      }

      injected.forEach((el) => el.remove());
    };
  }, [title, description, canonical, schema, noIndex]);
}
