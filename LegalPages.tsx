/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Privacy Policy and Terms of Service pages for SEBCO Travels.
 *
 * Both pages are written specifically for a UK private-hire operator that
 * uses: a self-hosted Node/Mongo backend, Stripe for card payments (manual
 * capture), and Mapbox for distance + autocomplete. Replace any text that
 * no longer reflects the way you actually operate.
 *
 * Each page supports EN + PL. The /privacy and /terms URLs are handled by
 * the router in App.tsx via `findLegalPage(pathname)`.
 */

import React, { FC, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LegalKind = 'privacy' | 'terms';

export interface LegalTranslations {
  backLink: string;     // "Back to home"
  lastUpdated: string;  // "Last updated: 4 June 2026"
  tableOfContents: string;
  intro: string;        // 1-paragraph intro
  sections: { heading: string; body: string }[]; // 4-8 sections
}

export interface LegalPageTranslations {
  privacy: { en: LegalTranslations; pl: LegalTranslations };
  terms: { en: LegalTranslations; pl: LegalTranslations };
  // Tab / language switcher
  viewInEnglish: string;
  viewInPolish: string;
}

// ---------------------------------------------------------------------------
// Bilingual content. Sourced from this template; edit in-place when you
// have a real Data Protection Officer review.
// ---------------------------------------------------------------------------

const EN_PRIVACY: LegalTranslations = {
  backLink: 'Back to home',
  lastUpdated: 'Last updated: 4 June 2026',
  tableOfContents: 'On this page',
  intro:
    'This policy explains what personal information SEBCO Travels Ltd ("we", "us") collects when you use our website, how we use it, who we share it with, how long we keep it, and the rights you have under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We are the "data controller" for the personal information you give us through this website.',
  sections: [
    {
      heading: '1. What we collect',
      body:
        'When you submit our pre-booking form we collect: your name, email address, mobile phone number, the pick-up and drop-off addresses you enter, the date and time you want to travel, the number of passengers and their ages, the number and type of child seats required, and any notes you type (such as flight numbers or meeting points). If you call or WhatsApp us, we keep a record of that conversation for safety and service quality. We do not knowingly collect information from anyone under 16.',
    },
    {
      heading: '2. How we use it',
      body:
        'We use your information to: (a) provide the taxi service you have booked; (b) send you a booking confirmation and, if applicable, the fixed-price quote; (c) contact you about your booking by SMS, WhatsApp, email or phone; (d) comply with our legal obligations as a licensed private-hire operator. We never sell your information. We never use it for marketing newsletters unless you have explicitly opted in.',
    },
    {
      heading: '3. Who we share it with',
      body:
        'We share the minimum information needed to operate the service: (a) Stripe (Stripe Payments Europe Ltd) processes your card details directly — we never see your full card number, only the last four digits and the payment status; (b) Mapbox (Mapbox Inc., US) receives the addresses you type in order to calculate distance and offer address suggestions; this transfer is protected by their Standard Contractual Clauses; (c) the chauffeur who drives you sees your name, phone number, pick-up address and notes; (d) our hosting provider (DigitalOcean / your self-host) stores the booking record in our MongoDB database. We do not share your data with any marketing or advertising company, ever.',
    },
    {
      heading: '4. Cookies and analytics',
      body:
        'This website does not set any tracking cookies and does not use Google Analytics, Facebook Pixel, or any third-party analytics. We do not fingerprint your device. If we add analytics in future we will update this policy and show you a consent banner first.',
    },
    {
      heading: '5. How long we keep your data',
      body:
        'Booking records are kept for 7 years (required by HMRC). Enquiry leads that never became a booking are kept for 12 months, then deleted. WhatsApp / phone records are kept for 2 years. You can ask us to delete your data earlier (see section 7).',
    },
    {
      heading: '6. How we protect your data',
      body:
        'Our backend is served over HTTPS only. Passwords are hashed with bcrypt. The database is not exposed to the public internet. Access to the backend is restricted by IP allowlist at the hosting provider. The chauffeur only sees the information they need for the single job in front of them.',
    },
    {
      heading: '7. Your rights',
      body:
        'You have the right to: (a) ask what we hold about you (Subject Access Request); (b) ask us to correct it; (c) ask us to delete it (subject to the retention rules in section 5); (d) object to us processing it; (e) ask us to send you a portable copy; (f) complain to the Information Commissioner\'s Office (ICO) at ico.org.uk. To exercise any of these, email us at caniseb1@gmail.com — we respond within 30 days.',
    },
    {
      heading: '8. Contact',
      body:
        'SEBCO Travels Ltd · caniseb1@gmail.com · +44 7411 113636 · Registered in England & Wales. For data protection matters please contact the same email address — we will deal with your request personally.',
    },
  ],
};

const EN_TERMS: LegalTranslations = {
  backLink: 'Back to home',
  lastUpdated: 'Last updated: 4 June 2026',
  tableOfContents: 'On this page',
  intro:
    'These Terms govern all pre-booking services provided by SEBCO Travels Ltd ("we", "us", "our") through this website. By submitting a pre-booking you accept these Terms. If you do not accept them, please do not submit the form. We may update these Terms from time to time; the version in force at the time of your booking will apply to that booking.',
  sections: [
    {
      heading: '1. Booking',
      body:
        'All bookings made through this website are pre-bookings (i.e. not on-demand). You must book at least 1 hour before the requested pick-up time. Bookings made by telephone or WhatsApp have the same legal status. A booking becomes a contract only when we send you a confirmation (by email, SMS or WhatsApp).',
    },
    {
      heading: '2. Pricing and payment',
      body:
        'The price you see on the booking form is the total price you will pay — there are no extras, no surge, no taxes on top, no per-bag charges. Payment is taken by card via Stripe. At the time of booking we authorise (hold) the amount on your card; we capture (charge) it only after your journey is completed. The hold is released automatically if your booking is cancelled under section 4.',
    },
    {
      heading: '3. Your responsibilities',
      body:
        'Please ensure: (a) the pick-up address is accurate and someone is available at the stated time; (b) the number of passengers and bags does not exceed the booked vehicle capacity (an executive people carrier seats up to 8 passengers and 8 large suitcases); (c) child seats are requested at the time of booking if needed; (d) you provide a working mobile phone number so we can contact you about delays or changes.',
    },
    {
      heading: '4. Cancellation and refund',
      body:
        'You may cancel free of charge up to 4 hours before the pick-up time. Cancellations between 4 hours and 1 hour before pick-up incur a 50% charge. Cancellations less than 1 hour before pick-up, or no-shows, incur the full charge. We will cancel your booking without charge and refund any pre-authorised amount if: (a) we cannot fulfil the booking for any reason; (b) your flight is cancelled by the airline and you let us know within 24 hours.',
    },
    {
      heading: '5. Flight delays',
      body:
        'For airport pick-ups we monitor your inbound flight. If your flight is delayed, we will be at the meeting point when you actually land. There is no extra fee for delays caused by the airline, the airport, or air-traffic control. We allow up to 60 minutes of free waiting time after the actual landing time before any additional waiting is chargeable at our standard hourly rate.',
    },
    {
      heading: '6. Behaviour and safety',
      body:
        'The chauffeur may refuse to start or continue a journey if: the customer is intoxicated and poses a safety risk; the customer verbally or physically abuses the chauffeur; the vehicle is being damaged; the customer is carrying illegal items. In these cases the full fare is still due.',
    },
    {
      heading: '7. Lost property',
      body:
        'Please report lost items within 7 days. We will return items at the customer\'s cost. We do not accept liability for items left on board after the journey, including phones, wallets, laptops and similar valuables.',
    },
    {
      heading: '8. Liability',
      body:
        'Our liability for any loss or damage is limited to the fare paid for the affected journey. We are not liable for indirect losses (missed flights, lost business, etc.) unless caused by our gross negligence. Nothing in these Terms limits any statutory rights you have as a consumer.',
    },
    {
      heading: '9. Governing law',
      body:
        'These Terms are governed by the laws of England and Wales. Any dispute will be subject to the exclusive jurisdiction of the courts of England and Wales.',
    },
  ],
};

const PL_PRIVACY: LegalTranslations = {
  backLink: 'Powrót na stronę główną',
  lastUpdated: 'Ostatnia aktualizacja: 4 czerwca 2026',
  tableOfContents: 'Na tej stronie',
  intro:
    'Niniejsza polityka wyjaśnia, jakie dane osobowe zbiera SEBCO Travels Ltd ("my", "nas") podczas korzystania z naszej strony internetowej, w jaki sposób je wykorzystujemy, komu je udostępniamy, jak długo je przechowujemy oraz jakie prawa przysługują Ci zgodnie z brytyjskim RODO (UK GDPR) i ustawą o ochronie danych z 2018 roku. Jesteśmy "administratorem danych" dla informacji, które podajesz nam za pośrednictwem tej strony.',
  sections: [
    {
      heading: '1. Co zbieramy',
      body:
        'Gdy wysyłasz formularz rezerwacji z wyprzedzeniem, zbieramy: imię i nazwisko, adres e-mail, numer telefonu komórkowego, wpisane adresy odbioru i docelowe, datę i godzinę podróży, liczbę pasażerów i ich wiek, liczbę i typ fotelików dziecięcych oraz wszelkie uwagi (np. numer lotu, miejsce spotkania). Jeśli dzwonisz lub piszesz na WhatsApp, zachowujemy zapis tej rozmowy dla bezpieczeństwa i jakości usług. Świadomie nie zbieramy danych od osób poniżej 16 roku życia.',
    },
    {
      heading: '2. Jak je wykorzystujemy',
      body:
        'Wykorzystujemy Twoje dane, aby: (a) świadczyć usługę taksówkową, którą zarezerwowałeś; (b) wysłać Ci potwierdzenie rezerwacji oraz, w stosownych przypadkach, wycenę w stałej cenie; (c) skontaktować się z Tobą w sprawie rezerwacji przez SMS, WhatsApp, e-mail lub telefon; (d) spełnić nasze zobowiązania prawne jako licencjonowanego przewoźnika. Nigdy nie sprzedajemy Twoich danych. Nigdy nie używamy ich do newslettera marketingowego, chyba że wyraziłeś na to wyraźną zgodę.',
    },
    {
      heading: '3. Komu je udostępniamy',
      body:
        'Udostępniamy minimalną ilość danych potrzebną do realizacji usługi: (a) Stripe (Stripe Payments Europe Ltd) przetwarza dane Twojej karty bezpośrednio — nigdy nie widzimy pełnego numeru karty, tylko ostatnie 4 cyfry i status płatności; (b) Mapbox (Mapbox Inc., USA) otrzymuje wpisane adresy w celu obliczenia dystansu i podpowiedzi adresowych; ten transfer jest chroniony ich Standardowymi Klauzulami Umownymi; (c) szofer widzi Twoje imię, numer telefonu, adres odbioru i uwagi; (d) nasz hosting (DigitalOcean lub Twój własny serwer) przechowuje rekord rezerwacji w bazie MongoDB. Nigdy nie udostępniamy danych firmom marketingowym ani reklamowym.',
    },
    {
      heading: '4. Pliki cookie i analityka',
      body:
        'Ta strona nie ustawia żadnych ciasteczek śledzących i nie korzysta z Google Analytics, Facebook Pixel ani żadnej innej analityki stron trzecich. Nie identyfikujemy Twojego urządzenia. Jeśli w przyszłości dodamy analitykę, zaktualizujemy tę politykę i najpierw pokażemy baner zgody.',
    },
    {
      heading: '5. Jak długo przechowujemy dane',
      body:
        'Rekordy rezerwacji przechowujemy przez 7 lat (wymóg HMRC). Zapytania, które nie stały się rezerwacjami, przechowujemy przez 12 miesięcy, a następnie usuwamy. Rozmowy WhatsApp / telefoniczne przechowujemy przez 2 lata. Możesz poprosić nas o wcześniejsze usunięcie Twoich danych (patrz sekcja 7).',
    },
    {
      heading: '6. Jak chronimy Twoje dane',
      body:
        'Nasz backend działa wyłącznie przez HTTPS. Hasła są haszowane przez bcrypt. Baza danych nie jest wystawiona na publiczny internet. Dostęp do backendu jest ograniczony przez listę dozwolonych adresów IP u dostawcy hostingu. Szofer widzi tylko te informacje, których potrzebuje do realizacji bieżącego zlecenia.',
    },
    {
      heading: '7. Twoje prawa',
      body:
        'Masz prawo do: (a) zapytania, jakie dane o Tobie posiadamy (żądanie dostępu do danych); (b) żądania ich poprawienia; (c) żądania ich usunięcia (z zastrzeżeniem zasad z sekcji 5); (d) sprzeciwu wobec ich przetwarzania; (e) żądania przenośnej kopii; (f) złożenia skargi do Information Commissioner\'s Office (ICO) na ico.org.uk. Aby skorzystać z któregokolwiek z tych praw, napisz na caniseb1@gmail.com — odpowiemy w ciągu 30 dni.',
    },
    {
      heading: '8. Kontakt',
      body:
        'SEBCO Travels Ltd · caniseb1@gmail.com · +44 7411 113636 · Zarejestrowana w Anglii i Walii. W sprawach ochrony danych prosimy o kontakt pod tym samym adresem e-mail — osobiście zajmiemy się Twoją sprawą.',
    },
  ],
};

const PL_TERMS: LegalTranslations = {
  backLink: 'Powrót na stronę główną',
  lastUpdated: 'Ostatnia aktualizacja: 4 czerwca 2026',
  tableOfContents: 'Na tej stronie',
  intro:
    'Niniejszy Regulamin reguluje wszystkie usługi rezerwacji z wyprzedzeniem świadczone przez SEBCO Travels Ltd ("my", "nas", "nasze") za pośrednictwem tej strony. Wysłanie formularza rezerwacji oznacza akceptację niniejszego Regulaminu. Jeśli go nie akceptujesz, prosimy o niewysyłanie formularza. Możemy aktualizować niniejszy Regulamin od czasu do czasu; wersja obowiązująca w momencie Twojej rezerwacji ma zastosowanie do tej rezerwacji.',
  sections: [
    {
      heading: '1. Rezerwacja',
      body:
        'Wszystkie rezerwacje dokonane przez tę stronę to rezerwacje z wyprzedzeniem (nie na żądanie). Musisz zarezerwować co najmniej 1 godzinę przed żądanym czasem odbioru. Rezerwacje telefoniczne lub przez WhatsApp mają taki sam status prawny. Rezerwacja staje się umową dopiero w momencie wysłania przez nas potwierdzenia (e-mailem, SMS-em lub WhatsApp).',
    },
    {
      heading: '2. Ceny i płatność',
      body:
        'Cena widoczna w formularzu rezerwacji to cena całkowita, którą zapłacisz — bez dopłat, bez taksometru, bez podatków, bez opłat za bagaż. Płatność jest pobierana kartą przez Stripe. W momencie rezerwacji autoryzujemy (blokujemy) kwotę na karcie; pobieramy ją (obciążamy) dopiero po zakończeniu podróży. Blokada jest automatycznie zwalniana w przypadku anulowania zgodnie z sekcją 4.',
    },
    {
      heading: '3. Twoje obowiązki',
      body:
        'Prosimy o zapewnienie: (a) poprawności adresu odbioru i obecności kogoś pod wskazanym adresem o ustalonej godzinie; (b) liczba pasażerów i bagaży nie przekracza pojemności pojazdu (luksusowy minivan mieści do 8 pasażerów i 8 dużych walizek); (c) foteliki dziecięce są zgłaszane przy rezerwacji; (d) podajesz działający numer telefonu komórkowego, abyśmy mogli skontaktować się w razie opóźnień lub zmian.',
    },
    {
      heading: '4. Anulowanie i zwrot',
      body:
        'Możesz anulować bezpłatnie do 4 godzin przed czasem odbioru. Anulowanie między 4 godzinami a 1 godziną przed odbiorem wiąże się z opłatą 50%. Anulowanie na mniej niż 1 godzinę przed odbiorem lub niestawienie się — pełna opłata. Anulujemy rezerwację bez opłat i zwrócimy autoryzowaną kwotę, jeśli: (a) nie możemy zrealizować rezerwacji z jakiegokolwiek powodu; (b) Twój lot został odwołany przez linię lotniczą i poinformujesz nas w ciągu 24 godzin.',
    },
    {
      heading: '5. Opóźnienia lotów',
      body:
        'Przy odbiorach z lotniska monitorujemy Twój przylot. Jeśli Twój lot się opóźnia, będziemy na miejscu spotkania, gdy faktycznie wylądujesz. Nie ma dodatkowej opłaty za opóźnienia spowodowane przez linię lotniczą, lotnisko lub kontrolę ruchu. Pozwalamy na do 60 minut bezpłatnego oczekiwania po faktycznym lądowaniu, zanim zacznie obowiązywać dodatkowa opłata za oczekiwanie wg naszej standardowej stawki godzinowej.',
    },
    {
      heading: '6. Zachowanie i bezpieczeństwo',
      body:
        'Szofer może odmówić rozpoczęcia lub kontynuowania podróży, jeśli: pasażer jest pod wpływem alkoholu i stanowi zagrożenie; pasażer znieważa lub atakuje szofera; pojazd jest uszkadzany; pasażer przewozi nielegalne przedmioty. W takich przypadkach pełna opłata jest nadal należna.',
    },
    {
      heading: '7. Rzeczy znalezione',
      body:
        'Zgłoś zgubione przedmioty w ciągu 7 dni. Zwrócimy je na koszt pasażera. Nie ponosimy odpowiedzialności za przedmioty pozostawione w pojeździe po zakończeniu podróży, w tym telefony, portfele, laptopy itp.',
    },
    {
      heading: '8. Odpowiedzialność',
      body:
        'Nasza odpowiedzialność za jakiekolwiek straty lub szkody jest ograniczona do opłaty zapłaconej za daną podróż. Nie ponosimy odpowiedzialności za straty pośrednie (przegapione loty, utracone korzyści biznesowe itp.), chyba że wynikają z naszego rażącego niedbalstwa. Postanowienia te nie ograniczają żadnych ustawowych praw konsumenta.',
    },
    {
      heading: '9. Prawo właściwe',
      body:
        'Niniejszy Regulamin podlega prawu Anglii i Walii. Wszelkie spory będą podlegać wyłącznej jurysdykcji sądów Anglii i Walii.',
    },
  ],
};

export const LEGAL_TRANSLATIONS: LegalPageTranslations = {
  privacy: { en: EN_PRIVACY, pl: PL_PRIVACY },
  terms:   { en: EN_TERMS,   pl: PL_TERMS   },
  viewInEnglish: 'English',
  viewInPolish: 'Polski',
};

export function findLegalPage(pathname: string): LegalKind | null {
  if (/^\/privacy\/?$/i.test(pathname)) return 'privacy';
  if (/^\/terms\/?$/i.test(pathname)) return 'terms';
  return null;
}

// Resolve a legal page in a given language, falling back to EN if missing.
function resolveLegal(kind: LegalKind, language: 'en' | 'pl'): LegalTranslations {
  const t = (LEGAL_TRANSLATIONS as any)[kind]?.[language] as LegalTranslations | undefined;
  return t ?? (LEGAL_TRANSLATIONS as any)[kind].en;
}

// ---------------------------------------------------------------------------
// SEO meta helper for legal pages
// ---------------------------------------------------------------------------

const LEGAL_SEO: Record<LegalKind, Record<'en' | 'pl', { title: string; description: string }>> = {
  privacy: {
    en: { title: 'Privacy Policy | SEBCO Travels', description: 'How SEBCO Travels collects, uses, stores and shares your personal data. UK GDPR compliant.' },
    pl: { title: 'Polityka Prywatności | SEBCO Travels', description: 'Jak SEBCO Travels zbiera, wykorzystuje, przechowuje i udostępnia Twoje dane osobowe. Zgodne z UK GDPR.' },
  },
  terms: {
    en: { title: 'Terms of Service | SEBCO Travels', description: 'Booking conditions, cancellation policy, payment terms and liability for SEBCO Travels pre-booking service.' },
    pl: { title: 'Regulamin | SEBCO Travels', description: 'Warunki rezerwacji, polityka anulowania, warunki płatności i odpowiedzialność za usługę SEBCO Travels.' },
  },
};

function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    if (typeof window !== 'undefined') {
      const href = window.location.href;
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', href);
    }
  }, [title, description]);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface LegalPageProps {
  kind: LegalKind;
  language: 'en' | 'pl';
  setLanguage: (l: 'en' | 'pl') => void;
  navigate: (to: string) => void;
  contactPhone: string;
  contactEmail: string;
}

const LegalPage: FC<LegalPageProps> = ({ kind, language, setLanguage, navigate, contactPhone, contactEmail }) => {
  const t = resolveLegal(kind, language);
  const seo = LEGAL_SEO[kind][language];
  useDocumentMeta(seo.title, seo.description);

  return (
    <section className="bg-white dark:bg-[#0B1F33] text-gray-800 dark:text-gray-100 min-h-[60vh]">
      {/* Page header */}
      <div className="bg-gray-50 dark:bg-[#0F2842] border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <button
            onClick={() => navigate('/')}
            className="text-xs uppercase tracking-wider font-bold text-[#D4AF37] hover:opacity-80 transition"
          >
            ← {t.backLink}
          </button>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {kind === 'privacy'
              ? (language === 'pl' ? 'Polityka Prywatności' : 'Privacy Policy')
              : (language === 'pl' ? 'Regulamin' : 'Terms of Service')}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t.lastUpdated}</p>

          {/* Language switcher (pills) */}
          <div className="mt-5 inline-flex rounded-md border border-black/10 dark:border-white/15 overflow-hidden">
            {(['en', 'pl'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  l === language
                    ? 'bg-[#D4AF37] text-[#1B3A57]'
                    : 'bg-white dark:bg-[#0B1F33] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
                aria-pressed={l === language}
              >
                {l === 'en' ? LEGAL_TRANSLATIONS.viewInEnglish : LEGAL_TRANSLATIONS.viewInPolish}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* TOC sidebar (desktop) */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                {t.tableOfContents}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {t.sections.map((s) => (
                  <li key={s.heading}>
                    <a href={`#${slugify(s.heading)}`} className="text-gray-600 dark:text-gray-300 hover:text-[#D4AF37] transition">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="lg:col-span-9 max-w-3xl">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
              {t.intro}
            </p>
            <div className="mt-10 space-y-10">
              {t.sections.map((s) => (
                <section key={s.heading} id={slugify(s.heading)}>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {s.heading}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    {s.body}
                  </p>
                </section>
              ))}
            </div>

            {/* Contact strip */}
            <div className="mt-14 rounded-xl border border-black/5 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {kind === 'privacy'
                  ? (language === 'pl' ? 'Pytania dotyczące danych? Napisz do nas:' : 'Questions about your data? Email us:')
                  : (language === 'pl' ? 'Pytania dotyczące rezerwacji? Zadzwoń lub napisz:' : 'Questions about a booking? Call or email:')}
              </p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                <a href={`mailto:${contactEmail}`} className="hover:text-[#D4AF37] transition">{contactEmail}</a>
                <span className="mx-2 text-gray-400">·</span>
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="hover:text-[#D4AF37] transition">{contactPhone}</a>
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default LegalPage;
