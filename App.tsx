/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, SVGProps, useEffect, useState } from 'react';
import BookingForm, { BookingTranslations } from './BookingForm';
import RoutePage, { ROUTES, findRouteBySlug, RoutePageTranslations, useRouteMeta } from './RoutePages';
import LegalPage, { findLegalPage } from './LegalPages';
import {
  LANGUAGES,
  detectInitialLanguage,
  persistLanguage,
  tx,
  type AppTranslations,
  type Language,
} from './i18n';

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const BUSINESS_PHONE = '+44 7411 113636';
const BUSINESS_PHONE_HREF = 'tel:+447411113636';
const BUSINESS_EMAIL = 'caniseb1@gmail.com';
// WhatsApp uses E.164 with no '+' or spaces.
const BUSINESS_WHATSAPP = '447411113636';
const BUSINESS_WHATSAPP_HREF =
  `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(
    "Hi SEBCO Travels, I'd like to pre-book a van transfer.",
  )}`;

// ===========================================================================
// Featured hero video — a 4K chauffeur video that plays muted in the
// background of the hero section. The still image (fleet-saloon.jpg)
// sits underneath as a poster, so the hero always looks full even on
// browsers/devices that block YouTube autoplay. Replace the ID with a new
// one if you re-cut the reel.
// ===========================================================================
const FEATURED_VIDEO_ID = 'bvTEIDjiqbM';

// Editorial hero image: a sleek dark exterior of a premium people carrier.
// Pulled from Unsplash so you get a free, high-resolution landscape shot
// without storing it in your own repo. Swap to a /img/hero.jpg when you
// have your own photography.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400&auto=format&fit=crop';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const SunIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
);
const MoonIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
const PhoneIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const WhatsAppIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
  </svg>
);
const YouTubeIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z"/>
  </svg>
);
const CheckIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd"/></svg>
);

// ---------------------------------------------------------------------------
// Global scroll-reveal setup. Add the `.reveal` className to any element
// you want to fade-up on scroll; the effect below adds `.reveal-in` when
// it enters the viewport. Pairs with the corresponding CSS in index.html.
// Re-runs on every route change so new content gets observed too.
// ---------------------------------------------------------------------------

function useGlobalReveal(pathname: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // No IO — make sure content is always visible.
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => el.classList.add('reveal-in'));
      return;
    }
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('reveal-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    targets.forEach((t) => io.observe(t));
    // Safety net 1: if an element never enters the viewport (very tall pages,
    // full-page screenshots, headless crawlers), reveal it after 1.5 s.
    const fallback1 = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.reveal-in)').forEach((el) => el.classList.add('reveal-in'));
    }, 1500);
    // Safety net 2: after 4 s, force-reveal any still-hidden element via
    // the `reveal-force-in` class which uses !important to win any cascade.
    const fallback2 = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.reveal-in)').forEach((el) => el.classList.add('reveal-force-in', 'reveal-in'));
    }, 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback1);
      window.clearTimeout(fallback2);
    };
  }, [pathname]);
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>(() => detectInitialLanguage());
  const [pathname, setPathname] = useState<string>(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );

  // Persist language choice to localStorage so it survives reloads.
  useEffect(() => { persistLanguage(language); }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Soft fade-up animation for every element with `.reveal`. Re-runs on
  // every route change so the new page's elements get observed.
  useGlobalReveal(pathname);

  // Tiny client-side router: react to back / forward + programmatic
  // pushState calls dispatched via the `navigate()` helper below.
  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(to: string) {
    const [pathOnly, hash] = to.split('#');
    const samePath = !pathOnly || pathOnly === window.location.pathname;
    if (!samePath) {
      window.history.pushState(null, '', to);
      setPathname(pathOnly || '/');
      // Allow React to paint the new page before scrolling.
      window.setTimeout(() => {
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }, 30);
    } else if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const t = tx(language);
  const toggleTheme = () => setTheme((th) => (th === 'dark' ? 'light' : 'dark'));

  // scrollTo used by old Header / nav buttons. Always go via navigate so
  // nav from a route page lands back on the home anchor.
  const scrollTo = (id: string) => navigate(id === 'top' ? '/' : `/#${id}`);

  const apiBaseUrl = (process.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';
  const mapboxAccessToken = (process.env.VITE_MAPBOX_ACCESS_TOKEN as string) || '';

  const route = findRouteBySlug(pathname);
  const legalKind = !route ? findLegalPage(pathname) : null;

  // Keep <title>, description and canonical in sync with the active page.
  // For route pages, RoutePage calls its own useRouteMeta(); for the home
  // we set the site defaults here.
  useRouteMeta(null, { title: t.siteSeoTitle, description: t.siteSeoDescription });

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-0">
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        toggleTheme={toggleTheme}
        theme={theme}
        scrollTo={scrollTo}
      />
      <main>
        {route ? (
          <RoutePage
            route={route}
            t={t.routePage}
            apiBaseUrl={apiBaseUrl}
            mapboxAccessToken={mapboxAccessToken}
            contactPhone={BUSINESS_PHONE}
            contactPhoneHref={BUSINESS_PHONE_HREF}
            navigate={navigate}
          />
        ) : legalKind ? (
          <LegalPage
            kind={legalKind}
            language={language}
            setLanguage={setLanguage}
            navigate={navigate}
            contactPhone={BUSINESS_PHONE}
            contactEmail={BUSINESS_EMAIL}
          />
        ) : (
          <>
            <Hero t={t} apiBaseUrl={apiBaseUrl} mapboxAccessToken={mapboxAccessToken} />
            <TrustBar t={t} />
            <Fleet t={t} />
            <HowItWorks t={t} />
            <PopularRoutes t={t} navigate={navigate} />
            <Services t={t} />
            <WhyChooseUs t={t} />
            <HowWeCalculate t={t} />
            <Testimonials t={t} />
            <Video t={t} />
            <Faq t={t} />
            <Contact t={t} />
          </>
        )}
      </main>
      <Footer t={t} />
      <StickyMobileCta t={t} scrollTo={scrollTo} />
      <WhatsAppBubble />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

interface HeaderProps {
  t: AppTranslations;
  language: Language;
  setLanguage: (l: Language) => void;
  toggleTheme: () => void;
  theme: string;
  scrollTo: (id: string) => void;
}

// Top-level nav shown in the desktop header. The full list (including
// routes / testimonials / faq) lives inside the mobile drawer below.
const NAV_DESKTOP = (t: AppTranslations) => [
  { id: 'book',     label: t.navBook,     accent: true  },
  { id: 'fleet',    label: t.navFleet,    accent: false },
  { id: 'services', label: t.navServices, accent: false },
  { id: 'video',    label: t.navVideo,    accent: false },
  { id: 'contact',  label: t.navContact,  accent: false },
];
const NAV_DRAWER = (t: AppTranslations) => [
  { id: 'book',        label: t.navBook,     accent: true  },
  { id: 'fleet',       label: t.navFleet,    accent: false },
  { id: 'services',    label: t.navServices, accent: false },
  { id: 'routes',      label: t.routesTitle, accent: false },
  { id: 'video',       label: t.navVideo,    accent: false },
  { id: 'testimonials',label: t.testTitle,   accent: false },
  { id: 'faq',         label: t.faqTitle,    accent: false },
  { id: 'contact',     label: t.navContact,  accent: false },
];

const MenuIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="6" y1="6" x2="18" y2="18"/>
    <line x1="18" y1="6" x2="6" y2="18"/>
  </svg>
);

const Header: FC<HeaderProps> = ({ t, language, setLanguage, toggleTheme, theme, scrollTo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  // Body scroll lock + close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B1F33]/85 backdrop-blur-md border-b border-black/5 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => scrollTo('top')} className="flex-shrink-0 -ml-1 px-1 py-2 min-h-[44px] flex items-center" aria-label="Go to top">
            <img
              src="/logo.svg"
              alt="Sebco Travels"
              className="h-28 w-auto sm:h-32"
              width={56}
              height={56}
            />
          </button>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {NAV_DESKTOP(t).map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-sm font-semibold transition min-h-[44px] px-1 ${
                  item.accent
                    ? 'text-[#D4AF37] hover:opacity-80'
                    : 'text-gray-700 dark:text-gray-200 hover:text-[#D4AF37]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={BUSINESS_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center h-10 w-10 min-h-[40px] min-w-[40px] rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition"
              aria-label="Message us on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <a
              href={BUSINESS_PHONE_HREF}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-[#D4AF37] transition min-h-[40px] px-2"
              aria-label={`${t.navCall} ${BUSINESS_PHONE}`}
            >
              <PhoneIcon className="h-4 w-4 text-[#D4AF37]" />
              <span className="hidden lg:inline">{BUSINESS_PHONE}</span>
            </a>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-transparent border border-gray-300 dark:border-white/15 rounded-md h-10 min-h-[40px] pl-7 pr-7 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                aria-label="Select language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-gray-800">
                    {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-sm">
                {LANGUAGES.find((l) => l.code === language)?.flag}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-10 w-10 min-h-[40px] min-w-[40px] rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="text-yellow-400" /> : <MoonIcon className="text-gray-800" />}
            </button>
            {/* Mobile hamburger — visible only on small screens */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 min-h-[40px] min-w-[40px] rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <MenuIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer — rendered as a sibling so the sticky header doesn't
          contain an absolutely positioned overlay. */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" id="mobile-drawer">
          <div
            className="absolute inset-0 bg-black/60 backdrop-anim"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute top-0 right-0 h-full w-[88%] max-w-sm bg-white dark:bg-[#0B1F33] shadow-2xl drawer-anim flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10 pt-safe-top">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">Menu</span>
              <button
                onClick={close}
                className="inline-flex items-center justify-center h-10 w-10 min-h-[40px] min-w-[40px] rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5 text-gray-800 dark:text-gray-100" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-4 scroll-touch">
              <ul className="space-y-1">
                {NAV_DRAWER(t).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => { scrollTo(item.id); close(); }}
                      className={`w-full text-left px-4 py-3 min-h-[44px] rounded-md text-base font-semibold transition ${
                        item.accent
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 active:bg-gray-200 dark:active:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="px-4 py-4 border-t border-black/10 dark:border-white/10 space-y-3 pb-safe-bottom">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`inline-flex items-center justify-center gap-1.5 h-10 min-h-[40px] px-3 rounded-full text-sm font-semibold border transition ${
                      l.code === language
                        ? 'bg-[#D4AF37] text-[#1B3A57] border-[#D4AF37]'
                        : 'border-black/15 dark:border-white/15 text-gray-800 dark:text-gray-100 hover:border-[#D4AF37]'
                    }`}
                    aria-pressed={l.code === language}
                  >
                    <span aria-hidden="true">{l.flag}</span> {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={BUSINESS_PHONE_HREF}
                  className="inline-flex items-center justify-center gap-2 h-11 min-h-[44px] rounded-md border border-[#D4AF37] text-[#D4AF37] text-sm font-bold"
                >
                  <PhoneIcon className="h-4 w-4" /> {t.navCall}
                </a>
                <a
                  href={BUSINESS_WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 min-h-[44px] rounded-md bg-[#25D366] text-white text-sm font-bold"
                >
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// ---------------------------------------------------------------------------
// Hero — premium dark full-bleed + booking widget overlay
// ---------------------------------------------------------------------------

interface HeroProps {
  t: AppTranslations;
  apiBaseUrl: string;
  mapboxAccessToken: string;
}

const Hero: FC<HeroProps> = ({ t, apiBaseUrl, mapboxAccessToken }) => (
  <section id="top" className="relative isolate overflow-hidden bg-[#0B1F33]">
    {/* Background: a sharp, high-resolution still image of a black
        executive MPV acting as the hero. Self-hosted from /img/ for
        reliability — the same image is reused in the Fleet section. */}
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <img
        src="/img/fleet-saloon.jpg"
        alt="Black executive MPV used for chauffeur transfers"
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.95) saturate(1.05)' }}
      />
      {/* Video layer on top of the still — plays where the browser
          allows autoplay (most desktop browsers). Sits above the still
          but is cropped so YouTube's UI never shows. */}
      <div className="absolute inset-0 scale-[1.5] origin-center">
        <iframe
          src={`https://www.youtube.com/embed/${FEATURED_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${FEATURED_VIDEO_ID}&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&playsinline=1&iv_load_policy=3&disable_picture_in_picture&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          title=""
          aria-hidden="true"
          className="w-full h-full"
          style={{
            border: 0,
            pointerEvents: 'none',
            filter: 'brightness(0.7) saturate(0.9)',
          }}
          allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
        />
      </div>
      {/* Horizontal gradient: dark on the left (text), clear on the right (image) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(11,31,51,0.88) 0%, rgba(11,31,51,0.65) 35%, rgba(11,31,51,0.30) 65%, rgba(11,31,51,0.10) 100%)',
        }}
      />
      {/* Subtle top fade for the eyebrow line + headline */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,31,51,0.7) 0%, rgba(11,31,51,0) 100%)',
        }}
      />
    </div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left: headline */}
        <div className="lg:col-span-7 text-white reveal">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#D4AF37]">
            {t.heroEyebrow}
          </p>
          <h2 className="mt-4 hero-title text-white">
            {t.heroTitle}{' '}
            <span className="text-[#D4AF37]">{t.heroTitleAccent}</span>
          </h2>
          <p className="mt-5 max-w-xl hero-subtitle text-gray-200">
            {t.heroSubtitle}
          </p>

          <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-w-lg">
            {[t.heroPoint1, t.heroPoint2, t.heroPoint3, t.heroPoint4].map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm sm:text-[15px] text-gray-100">
                <CheckIcon className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={BUSINESS_PHONE_HREF}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 text-white px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0B1F33] transition"
            >
              <PhoneIcon className="h-4 w-4" /> {BUSINESS_PHONE}
            </a>
            <span className="text-xs text-gray-300">24 / 7 dispatch · GB · Pre-book only</span>
          </div>
        </div>

        {/* Right: booking widget */}
        <div id="book" className="lg:col-span-5 scroll-mt-24">
          <BookingForm
            t={t.booking}
            apiBaseUrl={apiBaseUrl}
            mapboxAccessToken={mapboxAccessToken}
            variant="hero"
            contactPhone={BUSINESS_PHONE}
          />
        </div>
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------------------
// Sticky mobile CTA (visible only on small screens)
// ---------------------------------------------------------------------------

interface StickyMobileCtaProps {
  t: AppTranslations;
  scrollTo: (id: string) => void;
}

const StickyMobileCta: FC<StickyMobileCtaProps> = ({ t, scrollTo }) => (
  <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0B1F33]/95 backdrop-blur border-t border-black/10 dark:border-white/10 mobile-cta-shadow">
    <div className="grid grid-cols-3 gap-2 p-2 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]">
      <a
        href={BUSINESS_WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] text-white min-h-[44px] py-2.5 px-2 text-sm font-bold shadow-md"
      >
        <WhatsAppIcon className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href={BUSINESS_PHONE_HREF}
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#D4AF37] text-[#D4AF37] min-h-[44px] py-2.5 px-2 text-sm font-bold"
      >
        <PhoneIcon className="h-4 w-4" /> {t.stickyCall}
      </a>
      <button
        onClick={() => scrollTo('book')}
        className="inline-flex items-center justify-center rounded-md bg-[#D4AF37] text-[#1B3A57] min-h-[44px] py-2.5 px-2 text-sm font-black shadow-lg"
      >
        {t.stickyBook}
      </button>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// TrustBar — five inline credibility badges directly beneath the hero
// ---------------------------------------------------------------------------

const ShieldCheckIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const UmbrellaIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v2"/><path d="M5 10a7 7 0 0 1 14 0H5z"/><path d="M12 10v8a3 3 0 0 1-6 0"/>
  </svg>
);
const HomeHeartIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z"/>
  </svg>
);
const TagIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>
  </svg>
);
const ClockIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ---------------------------------------------------------------------------
// WhatsAppBubble — fixed green "chat" button, bottom-right. Hidden on
// mobile where the sticky mobile CTA already provides WhatsApp.
// ---------------------------------------------------------------------------

const WhatsAppBubble: FC = () => (
  <a
    href={BUSINESS_WHATSAPP_HREF}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="hidden md:flex fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-[#25D366] text-white items-center justify-center shadow-2xl hover:scale-105 transition-transform"
  >
    <span
      aria-hidden="true"
      className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping"
    />
    <WhatsAppIcon className="relative h-7 w-7" />
  </a>
);

const TrustBar: FC<{ t: AppTranslations }> = ({ t }) => {
  const items: { Icon: FC<SVGProps<SVGSVGElement>>; title: string; desc: string }[] = [
    { Icon: ShieldCheckIcon, title: t.trustDbsTitle,       desc: t.trustDbsDesc },
    { Icon: UmbrellaIcon,    title: t.trustInsuredTitle,   desc: t.trustInsuredDesc },
    { Icon: HomeHeartIcon,   title: t.trustFamilyTitle,    desc: t.trustFamilyDesc },
    { Icon: TagIcon,         title: t.trustPriceTitle,     desc: t.trustPriceDesc },
    { Icon: ClockIcon,       title: t.trustAvailableTitle, desc: t.trustAvailableDesc },
  ];
  return (
    <section aria-label="Trust" className="bg-white dark:bg-[#0F2842] border-y border-black/5 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-5">
          {items.map(({ Icon, title, desc }, i) => (
            <li
              key={title}
              className="reveal flex items-start gap-3"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-md bg-[#D4AF37]/10 text-[#D4AF37]">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{title}</p>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// HowItWorks — 3 numbered steps, light background to contrast TrustBar
// ---------------------------------------------------------------------------

const HowItWorks: FC<{ t: AppTranslations }> = ({ t }) => {
  const steps = [
    { n: '1', title: t.howStep1Title, desc: t.howStep1Desc },
    { n: '2', title: t.howStep2Title, desc: t.howStep2Desc },
    { n: '3', title: t.howStep3Title, desc: t.howStep3Desc },
  ];
  return (
    <section id="how" className="py-20 sm:py-28 bg-gray-50 dark:bg-black/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto reveal">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
          {t.howTitle}
        </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">{t.howSubtitle}</p>
        </div>
        <ol className="mt-14 grid gap-8 md:grid-cols-3 relative">
          {/* Connecting line on desktop */}
          <div aria-hidden="true" className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
          {steps.map((s) => (
            <li key={s.n} className="relative text-center md:text-left">
              <span className="relative z-10 inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#0B1F33] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F33] text-2xl font-black ring-4 ring-gray-50 dark:ring-black/20">
                {s.n}
              </span>
              <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// WhyChooseUs — 6 van-specific reasons in a dark feature grid
// ---------------------------------------------------------------------------

const UsersGroupIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const SuitcaseIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>
  </svg>
);
const BabyIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>
  </svg>
);
const PlaneIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 3.7c.3.3.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
);
const StarIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const WhyChooseUs: FC<{ t: AppTranslations }> = ({ t }) => {
  const reasons: { Icon: FC<SVGProps<SVGSVGElement>>; title: string; desc: string }[] = [
    { Icon: UsersGroupIcon,   title: t.why1Title, desc: t.why1Desc },
    { Icon: SuitcaseIcon,     title: t.why2Title, desc: t.why2Desc },
    { Icon: BabyIcon,         title: t.why3Title, desc: t.why3Desc },
    { Icon: TagIcon,          title: t.why4Title, desc: t.why4Desc },
    { Icon: PlaneIcon,        title: t.why5Title, desc: t.why5Desc },
    { Icon: StarIcon,         title: t.why6Title, desc: t.why6Desc },
  ];
  return (
    <section id="why" className="py-20 sm:py-28 bg-[#0B1F33] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto reveal">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
          {t.whyTitle}
        </h2>
          <p className="mt-6 text-lg text-gray-300">{t.whySubtitle}</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="reveal rounded-xl border border-white/10 bg-white/[0.03] p-7 hover:border-[#D4AF37]/40 hover:bg-white/[0.06] transition"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0B1F33] transition">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-gray-300 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// HowWeCalculate — transparent breakdown of the fare formula. This is the
// trust-builder section: real customers want to see the math. Sits on a
// light band between the dark WhyChooseUs grid and the gray Testimonials.
// ---------------------------------------------------------------------------

const CoinIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/>
    <path d="M12 16.5h.01"/>
  </svg>
);
const SpeedoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 1 18 0"/>
    <path d="M12 12l4 -4"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);
const PlugIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 2v6"/>
    <path d="M15 2v6"/>
    <path d="M6 8h12v3a6 6 0 0 1-12 0z"/>
    <path d="M12 17v5"/>
  </svg>
);
const PoundIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 4H9.5a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7H6"/>
    <path d="M6 18h12"/>
    <path d="M9 4l-3 7h6"/>
  </svg>
);

const HowWeCalculate: FC<{ t: AppTranslations }> = ({ t }) => {
  const items: { Icon: FC<SVGProps<SVGSVGElement>>; num: string; title: string; desc: string }[] = [
    { Icon: CoinIcon,    num: '01', title: t.calc1Title, desc: t.calc1Desc },
    { Icon: SpeedoIcon,  num: '02', title: t.calc2Title, desc: t.calc2Desc },
    { Icon: PoundIcon,   num: '03', title: t.calc3Title, desc: t.calc3Desc },
    { Icon: PlugIcon,    num: '04', title: t.calc4Title, desc: t.calc4Desc },
  ];
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-[#0F2842] dark:to-[#0B1F33] text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto reveal">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
            {t.calcEyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight gold-underline">
            {t.calcTitle}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.calcSubtitle}
          </p>
        </div>

        {/* Formula card */}
        <div className="mt-12 reveal max-w-4xl mx-auto rounded-2xl border border-[#D4AF37]/30 bg-white dark:bg-white/5 shadow-xl p-6 sm:p-8">
          <p className="text-xs uppercase tracking-wider font-bold text-[#D4AF37]">
            {t.calcFormulaLabel}
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 items-center gap-3 text-center font-mono text-sm sm:text-base">
            <div className="rounded-md bg-gray-50 dark:bg-white/5 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans font-bold">Base</p>
              <p className="mt-0.5 text-lg font-black text-gray-900 dark:text-white">£5</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans">van · £3 car</p>
            </div>
            <span className="text-2xl text-[#D4AF37] font-sans font-black">+</span>
            <div className="rounded-md bg-gray-50 dark:bg-white/5 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans font-bold">Per mile</p>
              <p className="mt-0.5 text-lg font-black text-gray-900 dark:text-white">£2.80</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans">van · £2.40 car</p>
            </div>
            <span className="text-2xl text-[#D4AF37] font-sans font-black">×</span>
            <div className="rounded-md bg-gray-50 dark:bg-white/5 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans font-bold">Distance</p>
              <p className="mt-0.5 text-lg font-black text-gray-900 dark:text-white">miles</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans">live Mapbox</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>+ optional add-ons:</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5">child seat £2</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5">heavy bag £1</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5">no surge</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5">no booking fee</span>
          </div>
        </div>

        {/* 4 reasons cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, num, title, desc }, i) => (
            <div
              key={title}
              className="reveal rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-6"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-mono font-bold text-[#D4AF37]">{num}</span>
              </div>
              <h3 className="mt-4 text-base font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Live example */}
        <div className="mt-10 reveal rounded-2xl bg-[#0B1F33] text-white p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
          <p className="text-xs uppercase tracking-wider font-bold text-[#D4AF37]">
            {t.calcExampleLabel}
          </p>
          <p className="mt-1 text-sm text-gray-300">
            {t.calcExampleRoute}
          </p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Base</p>
              <p className="mt-1 text-2xl font-black">£5.00</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">27 mi × £2.80</p>
              <p className="mt-1 text-2xl font-black">£75.60</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Add-ons</p>
              <p className="mt-1 text-2xl font-black">£0.00</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">Total</p>
              <p className="mt-1 text-3xl font-black text-[#D4AF37]">£80.60</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-gray-400 text-center">
            {t.calcExampleNote}
          </p>
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Existing sections (Fleet, Services, Video, Contact, Footer) — kept as-is
// for now. These get the same premium treatment in the next batch.
// ---------------------------------------------------------------------------

const Fleet: FC<{ t: AppTranslations }> = ({ t }) => (
  <section id="fleet" className="py-20 sm:py-28">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center reveal">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
          {t.fleetTitle}
        </h2>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.fleetSubtitle}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
        <FleetCard
          image="/img/fleet-saloon.jpg"
          title={t.carTitle}
          description={t.carDesc}
          badge="4 seats · Saloon"
        />
        <FleetCard
          image="/img/fleet-mpv.webp"
          title={t.citroenTitle}
          description={t.citroenDesc}
          badge="6 seats · 6 Seater"
        />
      </div>
    </div>
  </section>
);

const FleetCard: FC<{ image: string; title: string; description: string; badge: string }> = ({ image, title, description, badge }) => (
  <div className="bg-white dark:bg-white/5 rounded-lg shadow-lg overflow-hidden border border-black/5 dark:border-white/10 group">
    <div className="aspect-video overflow-hidden relative">
      <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/95 text-[#0B1F33] text-[10px] font-bold uppercase tracking-wider shadow-md">
        {badge}
      </span>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const Services: FC<{ t: AppTranslations }> = ({ t }) => (
  <section id="services" className="py-20 sm:py-28 bg-gray-50 dark:bg-black/20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
          {t.servicesTitle}
        </h2>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.servicesSubtitle}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ServiceCard icon="plane" title={t.airportTitle} description={t.airportDesc} />
        <ServiceCard icon="briefcase" title={t.corporateTitle} description={t.corporateDesc} />
        <ServiceCard icon="star" title={t.eventsTitle} description={t.eventsDesc} />
      </div>
    </div>
  </section>
);

const ServiceCard: FC<{ icon: 'plane' | 'briefcase' | 'star'; title: string; description: string }> = ({ icon, title, description }) => {
  const icons: Record<string, JSX.Element> = {
    plane: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 3.7c.3.3.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
    briefcase: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    star: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };
  return (
    <div className="bg-white dark:bg-white/5 p-7 rounded-lg shadow-md border border-black/5 dark:border-white/10 text-center">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gray-100 dark:bg-white/10 mx-auto">
        {icons[icon]}
      </div>
      <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const Video: FC<{ t: AppTranslations }> = ({ t }) => (
  <section id="video" className="py-12 sm:py-16 bg-[#0B1F33] text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 max-w-4xl mx-auto">
        <span className="flex-shrink-0 inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <StarIcon className="h-7 w-7" />
        </span>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t.videoTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-300">{t.videoSubtitle}</p>
        </div>
        <a
          href="#book"
          onClick={(e) => { e.preventDefault(); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="flex-shrink-0 inline-flex items-center gap-2 rounded-md bg-[#D4AF37] text-[#1B3A57] px-6 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 transition shadow-md"
        >
          {t.navBook}
        </a>
      </div>
    </div>
  </section>
);

const Contact: FC<{ t: AppTranslations }> = ({ t }) => (
  <section id="contact" className="py-20 sm:py-28 bg-gray-50 dark:bg-black/20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
        {t.contactTitle}
      </h2>
      <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.contactSubtitle}</p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
        <a href={BUSINESS_PHONE_HREF} className="flex items-center gap-3 text-lg font-semibold hover:text-[#D4AF37] transition">
          <PhoneIcon className="h-5 w-5 text-[#D4AF37]" /> {BUSINESS_PHONE}
        </a>
        <a
          href={BUSINESS_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-lg font-semibold hover:text-[#25D366] transition"
        >
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> WhatsApp
        </a>
        <a href={`mailto:${BUSINESS_EMAIL}`} className="flex items-center gap-3 text-lg font-semibold hover:text-[#D4AF37] transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          {BUSINESS_EMAIL}
        </a>
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------------------
// PopularRoutes — SEO + social-proof route grid with sample prices
// ---------------------------------------------------------------------------

interface PopularRoute { from: string; to: string; miles: number; price: number; slug: string }
const POPULAR_ROUTES: PopularRoute[] = ROUTES.map((r) => ({
  from: r.fromName,
  to: r.toShort,
  miles: r.miles,
  price: r.price,
  slug: r.slug,
}));

const PopularRoutes: FC<{ t: AppTranslations; navigate: (to: string) => void }> = ({ t, navigate }) => (
  <section id="routes" className="py-20 sm:py-28">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto reveal">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
          {t.routesTitle}
        </h2>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">{t.routesSubtitle}</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_ROUTES.map((r, i) => (
          <a
            key={r.slug}
            href={`/airport-transfers/${r.slug}`}
            onClick={(e) => { e.preventDefault(); navigate(`/airport-transfers/${r.slug}`); }}
            className="reveal group relative flex items-center justify-between gap-4 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-5 hover:border-[#D4AF37] hover:shadow-lg hover:-translate-y-0.5 transition"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <span className="truncate">{r.from}</span>
                <svg className="h-4 w-4 text-[#D4AF37] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span className="truncate">{r.to}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.miles} mi</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{t.routesFromPrice}</p>
              <p className="text-2xl font-black text-[#D4AF37] leading-none">£{r.price}</p>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">{t.routesNote}</p>
    </div>
  </section>
);

// ---------------------------------------------------------------------------
// Testimonials — 3 review cards with 5-star ratings
// ---------------------------------------------------------------------------

const Stars: FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z"/>
      </svg>
    ))}
  </div>
);

const Testimonials: FC<{ t: AppTranslations }> = ({ t }) => {
  const reviews = [
    { quote: t.test1Quote, name: t.test1Name, trip: t.test1Trip },
    { quote: t.test2Quote, name: t.test2Name, trip: t.test2Trip },
    { quote: t.test3Quote, name: t.test3Name, trip: t.test3Trip },
  ];
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-gray-50 dark:bg-black/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto reveal">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
          {t.testTitle}
        </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">{t.testSubtitle}</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={r.name}
              className="reveal rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-7 shadow-sm flex flex-col"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Stars />
              <blockquote className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed flex-1">
                <span className="text-4xl text-[#D4AF37] leading-none align-top mr-1">&ldquo;</span>
                {r.quote}
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-black/5 dark:border-white/10">
                <p className="font-bold text-gray-900 dark:text-white">{r.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.trip}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// FAQ — native <details> accordion (no JS state)
// ---------------------------------------------------------------------------

const Faq: FC<{ t: AppTranslations }> = ({ t }) => {
  const items = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
    { q: t.faq5Q, a: t.faq5A },
    { q: t.faq6Q, a: t.faq6A },
  ];
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center reveal">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white gold-underline">
            {t.faqTitle}
          </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">{t.faqSubtitle}</p>
        </div>
        <div className="mt-12 divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10">
          {items.map((item, i) => (
            <details
              key={i}
              className="reveal group py-5"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white pr-4">
                  {item.q}
                </h3>
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
  );
};

// ---------------------------------------------------------------------------
// Premium 4-column footer (replaces the old simple footer)
// ---------------------------------------------------------------------------

const Footer: FC<{ t: AppTranslations }> = ({ t }) => (
  <footer className="bg-[#0B1F33] text-gray-300 border-t border-white/10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + contact */}
        <div>
          <img
            src="/logo.svg"
            alt="Sebco Travels"
            className="h-44 w-auto"
            width={80}
            height={80}
          />
          <p className="text-xs mt-3 tracking-[0.2em] uppercase text-[#D4AF37]">{t.tagline}</p>
          <div className="mt-5 space-y-2 text-sm">
            <a href={BUSINESS_PHONE_HREF} className="flex items-center gap-2 hover:text-[#D4AF37] transition">
              <PhoneIcon className="h-4 w-4 text-[#D4AF37]" /> {BUSINESS_PHONE}
            </a>
            <a
              href={BUSINESS_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#25D366] transition"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
            </a>
            <a href={`mailto:${BUSINESS_EMAIL}`} className="flex items-center gap-2 hover:text-[#D4AF37] transition">
              <svg className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {BUSINESS_EMAIL}
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white">{t.footerCol1Title}</h4>
          <ul className="mt-5 space-y-2 text-sm">
            <li><a href="#services" className="hover:text-[#D4AF37] transition">{t.airportTitle}</a></li>
            <li><a href="#services" className="hover:text-[#D4AF37] transition">{t.corporateTitle}</a></li>
            <li><a href="#services" className="hover:text-[#D4AF37] transition">{t.eventsTitle}</a></li>
            <li><a href="#fleet" className="hover:text-[#D4AF37] transition">{t.fleetTitle}</a></li>
          </ul>
        </div>

        {/* Popular routes */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white">{t.footerCol2Title}</h4>
          <ul className="mt-5 space-y-2 text-sm">
            {POPULAR_ROUTES.slice(0, 5).map((r) => (
              <li key={`f-${r.slug}`}>
                <a href={`/airport-transfers/${r.slug}`} className="hover:text-[#D4AF37] transition">
                  {r.from} → {r.to.split(' ')[0]}
                </a>
              </li>
            ))}
            <li><a href="#routes" className="text-[#D4AF37] font-semibold hover:opacity-80 transition">{t.routesTitle} →</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white">{t.footerCol3Title}</h4>
          <ul className="mt-5 space-y-2 text-sm">
            <li><a href="#how" className="hover:text-[#D4AF37] transition">{t.howTitle}</a></li>
            <li><a href="#why" className="hover:text-[#D4AF37] transition">{t.whyTitle}</a></li>
            <li><a href="#testimonials" className="hover:text-[#D4AF37] transition">{t.testTitle}</a></li>
            <li><a href="#faq" className="hover:text-[#D4AF37] transition">{t.faqTitle}</a></li>
            <li><a href="#contact" className="hover:text-[#D4AF37] transition">{t.contactTitle}</a></li>
          </ul>
        </div>
      </div>

      {/* Credentials strip */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <p className="text-center text-xs text-gray-400 tracking-wide">{t.footerCredentials}</p>
      </div>

      {/* Legal row */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
        <p>{t.copyright}</p>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-[#D4AF37] transition">{t.privacyPolicy}</a>
          <span aria-hidden="true">·</span>
          <a href="/terms" className="hover:text-[#D4AF37] transition">{t.termsOfService}</a>
        </div>
      </div>
    </div>
  </footer>
);

export default App;
