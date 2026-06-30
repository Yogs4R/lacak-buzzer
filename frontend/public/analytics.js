if (window.trustedTypes && window.trustedTypes.createPolicy) {
  try {
    window.trustedTypes.createPolicy('default', {
      createHTML: (string) => string,
      createScript: (string) => string,
      createScriptURL: (string) => string,
    });
  } catch (e) {}
}

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
try {
  const consent = localStorage.getItem('cookieConsent');
  gtag('consent', 'default', {
    'analytics_storage': consent === 'accepted' ? 'granted' : 'denied',
    'ad_storage': consent === 'accepted' ? 'granted' : 'denied',
    'personalization_storage': consent === 'accepted' ? 'granted' : 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  });
} catch (e) {
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'personalization_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  });
}

gtag('js', new Date());
gtag('config', 'G-WR37292QLG');
