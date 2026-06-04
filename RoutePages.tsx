/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Per-route SEO landing pages.
 *
 * One file ships:
 *  - ROUTES                  static data for every supported airport route
 *  - findRouteBySlug()       URL -> RouteData lookup used by the router
 *  - SITE_ORIGIN             absolute site origin, used by canonical + JSON-LD
 *  - useRouteMeta()          mutates <title>, <meta description>, canonical
 *                            link and a route-specific JSON-LD Service block
 *  - RoutePage               default export, renders the entire route page
 *
 * Each route page is built around a pre-filled BookingForm in the dark
 * hero, followed by trust signals, "what's included", route-specific copy,
 * a short FAQ and a cross-link grid to the other routes.
 */

import React, { FC, SVGProps, useEffect } from 'react';
import BookingForm, { BookingTranslations } from './BookingForm';

// ---------------------------------------------------------------------------
// Route data
// ---------------------------------------------------------------------------

export interface RouteData {
  slug: string;
  fromName: string;
  toName: string;        // human-readable, e.g. "Heathrow Airport"
  toShort: string;       // short label, e.g. "Heathrow (LHR)"
  miles: number;
  durationMin: number;
  price: number;         // major-unit GBP
  // Coordinates for the BookingForm pre-fill ([lng, lat] / [lng, lat]).
  fromAddress: string;
  fromLat: number;
  fromLng: number;
  toAddress: string;
  toLat: number;
  toLng: number;
  // Hero image URL. Per-route so each page ranks for a different keyword.
  // TODO: replace with your own airport photography in /public/img/routes/.
  // Until then we use picsum.photos with route-specific seeds so each page
  // has a unique (and reliable) image.
  heroImage: string;
  // SEO. Keep title <= 60 chars, description <= 160 chars.
  seoTitle: string;
  seoDescription: string;
}

export const ROUTES: RouteData[] = [
  {
    slug: 'reading-heathrow',
    fromName: 'Reading',
    toName: 'Heathrow Airport',
    toShort: 'Heathrow (LHR)',
    miles: 28,
    durationMin: 40,
    price: 75,
    fromAddress: 'Reading, Berkshire, UK',
    fromLat: 51.4543,
    fromLng: -0.9781,
    toAddress: 'London Heathrow Airport (LHR), UK',
    toLat: 51.4700,
    toLng: -0.4543,
    heroImage: 'https://picsum.photos/seed/sebco-reading-lhr/2400/1350',
    seoTitle: 'Reading to Heathrow Taxi | Fixed £75 Van | SEBCO Travels',
    seoDescription:
      'Pre-book a chauffeur-driven van from Reading to Heathrow. £75 fixed price, child seats free, flight tracking, 24/7 dispatch. Pay only on arrival.',
  },
  {
    slug: 'slough-heathrow',
    fromName: 'Slough',
    toName: 'Heathrow Airport',
    toShort: 'Heathrow (LHR)',
    miles: 9,
    durationMin: 20,
    price: 35,
    fromAddress: 'Slough, Berkshire, UK',
    fromLat: 51.5105,
    fromLng: -0.5950,
    toAddress: 'London Heathrow Airport (LHR), UK',
    toLat: 51.4700,
    toLng: -0.4543,
    heroImage: 'https://picsum.photos/seed/sebco-slough-lhr/2400/1350',
    seoTitle: 'Slough to Heathrow Taxi | Fixed £35 Van | SEBCO Travels',
    seoDescription:
      'Pre-booked chauffeur van from Slough to Heathrow for £35 fixed. Family-friendly, child seats included, flight tracking, no surge pricing.',
  },
  {
    slug: 'reading-gatwick',
    fromName: 'Reading',
    toName: 'Gatwick Airport',
    toShort: 'Gatwick (LGW)',
    miles: 70,
    durationMin: 95,
    price: 165,
    fromAddress: 'Reading, Berkshire, UK',
    fromLat: 51.4543,
    fromLng: -0.9781,
    toAddress: 'London Gatwick Airport (LGW), UK',
    toLat: 51.1537,
    toLng: -0.1821,
    heroImage: 'https://picsum.photos/seed/sebco-reading-lgw/2400/1350',
    seoTitle: 'Reading to Gatwick Taxi | Fixed £165 Van | SEBCO Travels',
    seoDescription:
      'Pre-book a van from Reading to Gatwick Airport. £165 fixed upfront. Up to 8 passengers, free child seats, flight tracking, DBS-checked driver.',
  },
  {
    slug: 'oxford-heathrow',
    fromName: 'Oxford',
    toName: 'Heathrow Airport',
    toShort: 'Heathrow (LHR)',
    miles: 50,
    durationMin: 75,
    price: 110,
    fromAddress: 'Oxford, Oxfordshire, UK',
    fromLat: 51.7520,
    fromLng: -1.2577,
    toAddress: 'London Heathrow Airport (LHR), UK',
    toLat: 51.4700,
    toLng: -0.4543,
    heroImage: 'https://picsum.photos/seed/sebco-oxford-lhr/2400/1350',
    seoTitle: 'Oxford to Heathrow Taxi | Fixed £110 Van | SEBCO Travels',
    seoDescription:
      'Door-to-door chauffeur van Oxford to Heathrow for a fixed £110. Pre-book in 60 seconds. Family-friendly, fully insured, no surge fees.',
  },
  {
    slug: 'reading-stansted',
    fromName: 'Reading',
    toName: 'Stansted Airport',
    toShort: 'Stansted (STN)',
    miles: 92,
    durationMin: 130,
    price: 195,
    fromAddress: 'Reading, Berkshire, UK',
    fromLat: 51.4543,
    fromLng: -0.9781,
    toAddress: 'London Stansted Airport (STN), UK',
    toLat: 51.8860,
    toLng: 0.2389,
    heroImage: 'https://picsum.photos/seed/sebco-reading-stn/2400/1350',
    seoTitle: 'Reading to Stansted Taxi | Fixed £195 Van | SEBCO Travels',
    seoDescription:
      'Pre-booked executive people-carrier from Reading to Stansted. £195 fixed. Free child seats, flight tracking, professional chauffeur.',
  },
  {
    slug: 'london-luton',
    fromName: 'Central London',
    toName: 'Luton Airport',
    toShort: 'Luton (LTN)',
    miles: 36,
    durationMin: 60,
    price: 85,
    fromAddress: 'Central London, UK',
    fromLat: 51.5074,
    fromLng: -0.1278,
    toAddress: 'London Luton Airport (LTN), UK',
    toLat: 51.8763,
    toLng: -0.3717,
    heroImage: 'https://picsum.photos/seed/sebco-london-ltn/2400/1350',
    seoTitle: 'Central London to Luton Taxi | Fixed £85 | SEBCO Travels',
    seoDescription:
      'Chauffeur-driven van from Central London to Luton Airport. Fixed £85. Pre-book in 60 seconds. 24/7 dispatch, child seats free, no surge.',
  },
];

export function findRouteBySlug(pathname: string): RouteData | null {
  const m = pathname.match(/^\/airport-transfers\/([a-z0-9-]+)\/?$/i);
  if (!m) return null;
  return ROUTES.find((r) => r.slug === m[1].toLowerCase()) || null;
}

// Origin is read from the live page in the browser; in SSR / build it falls
// back to your production domain. Edit this when you point your real DNS.
export const SITE_ORIGIN =
  (typeof window !== 'undefined' && window.location.origin) || 'https://sebcotravels.co.uk';

// ---------------------------------------------------------------------------
// useRouteMeta — keeps <title>, description, canonical + Service JSON-LD in
// sync with the active route.
// ---------------------------------------------------------------------------

function setMetaTag(name: string, value: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const ROUTE_JSONLD_ID = 'sebco-route-jsonld';

function setRouteJsonLd(route: RouteData | null) {
  const existing = document.getElementById(ROUTE_JSONLD_ID);
  if (!route) {
    if (existing) existing.remove();
    return;
  }
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${route.fromName} to ${route.toName} airport transfer`,
    serviceType: 'Pre-booked airport transfer',
    provider: { '@id': `${SITE_ORIGIN}/#business` },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    offers: {
      '@type': 'Offer',
      price: route.price.toString(),
      priceCurrency: 'GBP',
      url: `${SITE_ORIGIN}/airport-transfers/${route.slug}`,
      availability: 'https://schema.org/InStock',
    },
    description: route.seoDescription,
  };
  let el = existing as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = ROUTE_JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function useRouteMeta(route: RouteData | null, defaults: { title: string; description: string }) {
  useEffect(() => {
    const title = route?.seoTitle ?? defaults.title;
    const description = route?.seoDescription ?? defaults.description;
    document.title = title;
    setMetaTag('description', description);
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:url', window.location.href, 'property');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setCanonical(window.location.href);
    setRouteJsonLd(route);
  }, [route?.slug, defaults.title, defaults.description]);
}

// ---------------------------------------------------------------------------
// Public translations interface for a route page
// ---------------------------------------------------------------------------

export interface RoutePageTranslations {
  breadcrumbHome: string;
  breadcrumbAirportTransfers: string;
  heroEyebrow: string;            // "Pre-booked airport transfer"
  heroConnector: string;          // "to" — joins from / to
  heroSuffix: string;             // "airport transfer"
  heroSubtitle: string;           // generic line about fixed price + child seats
  metricMiles: string;            // "miles"
  metricMinutes: string;          // "min drive"
  metricFromPrice: string;        // "from"
  includedTitle: string;
  included1: string;
  included2: string;
  included3: string;
  included4: string;
  included5: string;
  included6: string;
  whyTitle: string;
  whyDesc: string;                // 1–2 line lead under whyTitle
  why1Title: string; why1Desc: string;
  why2Title: string; why2Desc: string;
  why3Title: string; why3Desc: string;
  routeFaqTitle: string;
  rFaq1Q: string; rFaq1A: string;
  rFaq2Q: string; rFaq2A: string;
  rFaq3Q: string; rFaq3A: string;
  rFaq4Q: string; rFaq4A: string;
  otherRoutesTitle: string;
  otherRoutesSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBook: string;
  ctaCall: string;
  // Booking widget translations are forwarded through here.
  booking: BookingTranslations;
}

// ---------------------------------------------------------------------------
// Icons local to this file
// ---------------------------------------------------------------------------

const Check: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd"/>
  </svg>
);

const Arrow: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Phone: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

// Fallback hero used by the home page (App.tsx). Route pages now use the
// per-route `heroImage` field on RouteData so each URL has a unique image.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400&auto=format&fit=crop';

// ---------------------------------------------------------------------------
// RoutePage — full landing page for a single route
// ---------------------------------------------------------------------------

export interface RoutePageProps {
  route: RouteData;
  t: RoutePageTranslations;
  apiBaseUrl: string;
  mapboxAccessToken: string;
  contactPhone: string;
  contactPhoneHref: string;
  navigate: (to: string) => void;
}

const RoutePage: FC<RoutePageProps> = ({
  route,
  t,
  apiBaseUrl,
  mapboxAccessToken,
  contactPhone,
  contactPhoneHref,
  navigate,
}) => {
  // Keep <title>, description, canonical and JSON-LD pinned to this route.
  useRouteMeta(route, { title: route.seoTitle, description: route.seoDescription });

  const initialPickup = {
    address: route.fromAddress,
    lat: route.fromLat,
    lng: route.fromLng,
  };
  const initialDropoff = {
    address: route.toAddress,
    lat: route.toLat,
    lng: route.toLng,
  };

  const included = [
    t.included1, t.included2, t.included3, t.included4, t.included5, t.included6,
  ];

  const whys = [
    { title: t.why1Title, desc: t.why1Desc },
    { title: t.why2Title, desc: t.why2Desc },
    { title: t.why3Title, desc: t.why3Desc },
  ];

  const faqs = [
    { q: t.rFaq1Q, a: t.rFaq1A },
    { q: t.rFaq2Q, a: t.rFaq2A },
    { q: t.rFaq3Q, a: t.rFaq3A },
    { q: t.rFaq4Q, a: t.rFaq4A },
  ];

  const otherRoutes = ROUTES.filter((r) => r.slug !== route.slug).slice(0, 5);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section id="top" className="relative isolate overflow-hidden bg-[#0B1F33]">
        <div className="absolute inset-0 -z-10">
          <img
            src={route.heroImage}
            alt={`${route.fromName} to ${route.toName} airport transfer`}
            className="w-full h-full object-cover opacity-70"
            loading="eager"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-20 lg:pb-24">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-300/80">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-[#D4AF37] transition">
                  {t.breadcrumbHome}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a href="/#routes" onClick={(e) => { e.preventDefault(); navigate('/#routes'); }} className="hover:text-[#D4AF37] transition">
                  {t.breadcrumbAirportTransfers}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#D4AF37] font-semibold truncate">
                {route.fromName} → {route.toShort}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: route headline + metrics */}
            <div className="lg:col-span-7 text-white reveal">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#D4AF37]">
                {t.heroEyebrow}
              </p>
              <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
                {route.fromName} <span className="text-[#D4AF37]">{t.heroConnector}</span> {route.toName}
                <br />
                <span className="text-gray-300 text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {t.heroSuffix}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-lg text-gray-200">
                {t.heroSubtitle}
              </p>

              {/* Metric strip */}
              <dl className="mt-7 grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{t.metricFromPrice}</dt>
                  <dd className="mt-1 text-3xl sm:text-4xl font-black text-[#D4AF37] leading-none">£{route.price}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{t.metricMiles}</dt>
                  <dd className="mt-1 text-3xl sm:text-4xl font-black text-white leading-none">{route.miles}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{t.metricMinutes}</dt>
                  <dd className="mt-1 text-3xl sm:text-4xl font-black text-white leading-none">{route.durationMin}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={contactPhoneHref}
                  className="inline-flex items-center gap-2 rounded-md border border-white/30 text-white px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0B1F33] transition"
                >
                  <Phone className="h-4 w-4" /> {contactPhone}
                </a>
              </div>
            </div>

            {/* Right: pre-filled booking widget */}
            <div id="book" className="lg:col-span-5 scroll-mt-24">
              <BookingForm
                t={t.booking}
                apiBaseUrl={apiBaseUrl}
                mapboxAccessToken={mapboxAccessToken}
                variant="hero"
                contactPhone={contactPhone}
                initialPickup={initialPickup}
                initialDropoff={initialDropoff}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================ WHAT'S INCLUDED ============================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white text-center">
            {t.includedTitle}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {included.map((line) => (
              <li key={line} className="flex items-start gap-3 rounded-lg bg-white dark:bg-white/5 p-4 border border-black/5 dark:border-white/10">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#D4AF37]/15 text-[#D4AF37]">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-100 leading-snug">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================ WHY THIS ROUTE ============================ */}
      <section className="py-20 sm:py-28 bg-[#0B1F33] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white gold-underline">
              {t.whyTitle}
            </h2>
            <p className="mt-6 text-lg text-gray-300">{t.whyDesc}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {whys.map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-7">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Check className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-gray-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ ROUTE FAQ ============================ */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white text-center gold-underline">
            {t.routeFaqTitle}
          </h2>
          <div className="mt-10 divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10">
            {faqs.map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white pr-4">{item.q}</h3>
                  <span className="flex-shrink-0 mt-1 inline-flex items-center justify-center h-6 w-6 rounded-full border border-[#D4AF37] text-[#D4AF37] transition group-open:rotate-45">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed pr-10">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ OTHER ROUTES ============================ */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
              {t.otherRoutesTitle}
            </h2>
            <p className="mt-6 text-base text-gray-600 dark:text-gray-300">{t.otherRoutesSubtitle}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherRoutes.map((r) => (
              <a
                key={r.slug}
                href={`/airport-transfers/${r.slug}`}
                onClick={(e) => { e.preventDefault(); navigate(`/airport-transfers/${r.slug}`); }}
                className="group relative flex items-center justify-between gap-4 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-5 hover:border-[#D4AF37] hover:shadow-lg transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <span className="truncate">{r.fromName}</span>
                    <Arrow className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="truncate">{r.toShort}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.miles} mi</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{t.metricFromPrice}</p>
                  <p className="text-2xl font-black text-[#D4AF37] leading-none">£{r.price}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="py-16 sm:py-20 bg-[#0B1F33] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.ctaTitle}</h2>
          <p className="mt-4 text-gray-300">{t.ctaSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#book"
              onClick={(e) => { e.preventDefault(); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center justify-center rounded-md bg-[#D4AF37] text-[#1B3A57] px-6 py-3 text-sm font-black uppercase tracking-wider shadow-lg hover:opacity-90 transition"
            >
              {t.ctaBook}
            </a>
            <a
              href={contactPhoneHref}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0B1F33] transition"
            >
              <Phone className="h-4 w-4" /> {t.ctaCall} {contactPhone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default RoutePage;
