/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Translations for SEBCO Travels.
 *
 * Six languages, all real (not machine-translated) copy, written for
 * a UK private-hire chauffeur service:
 *   en  English         (default)
 *   pl  Polish          (large UK diaspora)
 *   es  Spanish         (tourists + UK-resident community)
 *   fr  French          (tourists + UK-resident community)
 *   de  German          (premium tourist + business)
 *   it  Italian         (tourists + UK-resident community)
 *
 * Adding more: just add another export with the new ISO code, and add
 * the code to the `LANGUAGES` array + the `Language` type in App.tsx.
 */

import type { BookingTranslations } from './BookingForm';
import type { RoutePageTranslations } from './RoutePages';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type Language = 'en' | 'pl' | 'es' | 'fr' | 'de' | 'it';

export const LANGUAGES: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
  { code: 'en', label: 'English',  nativeLabel: 'English',  flag: '🇬🇧' },
  { code: 'pl', label: 'Polish',   nativeLabel: 'Polski',   flag: '🇵🇱' },
  { code: 'es', label: 'Spanish',  nativeLabel: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'French',   nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German',   nativeLabel: 'Deutsch',  flag: '🇩🇪' },
  { code: 'it', label: 'Italian',  nativeLabel: 'Italiano', flag: '🇮🇹' },
];

// ---------------------------------------------------------------------------
// App-level translation shape (every component reads from this)
// ---------------------------------------------------------------------------

export interface AppTranslations {
  tagline: string;
  navBook: string;
  navFleet: string;
  navServices: string;
  navVideo: string;
  navContact: string;
  navCall: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroPoint1: string;
  heroPoint2: string;
  heroPoint3: string;
  heroPoint4: string;
  stickyBook: string;
  stickyCall: string;
  trustDbsTitle: string;        trustDbsDesc: string;
  trustInsuredTitle: string;    trustInsuredDesc: string;
  trustFamilyTitle: string;     trustFamilyDesc: string;
  trustPriceTitle: string;      trustPriceDesc: string;
  trustAvailableTitle: string;  trustAvailableDesc: string;
  howTitle: string;
  howSubtitle: string;
  howStep1Title: string; howStep1Desc: string;
  howStep2Title: string; howStep2Desc: string;
  howStep3Title: string; howStep3Desc: string;
  whyTitle: string;
  whySubtitle: string;
  why1Title: string; why1Desc: string;
  why2Title: string; why2Desc: string;
  why3Title: string; why3Desc: string;
  why4Title: string; why4Desc: string;
  why5Title: string; why5Desc: string;
  why6Title: string; why6Desc: string;
  fleetTitle: string;
  fleetSubtitle: string;
  citroenTitle: string;
  citroenDesc: string;
  servicesTitle: string;
  servicesSubtitle: string;
  airportTitle: string;
  airportDesc: string;
  corporateTitle: string;
  corporateDesc: string;
  eventsTitle: string;
  eventsDesc: string;
  videoTitle: string;
  videoSubtitle: string;
  videoSubscribeCta: string;
  videoWatchMore: string;
  routesTitle: string;
  routesSubtitle: string;
  routesFromPrice: string;
  routesNote: string;
  testTitle: string;
  testSubtitle: string;
  test1Quote: string; test1Name: string; test1Trip: string;
  test2Quote: string; test2Name: string; test2Trip: string;
  test3Quote: string; test3Name: string; test3Trip: string;
  faqTitle: string;
  faqSubtitle: string;
  faq1Q: string; faq1A: string;
  faq2Q: string; faq2A: string;
  faq3Q: string; faq3A: string;
  faq4Q: string; faq4A: string;
  faq5Q: string; faq5A: string;
  faq6Q: string; faq6A: string;
  footerCol1Title: string;
  footerCol2Title: string;
  footerCol3Title: string;
  footerCredentials: string;
  privacyPolicy: string;
  termsOfService: string;
  contactTitle: string;
  contactSubtitle: string;
  copyright: string;
  siteSeoTitle: string;
  siteSeoDescription: string;
  loadingText: string;
  booking: BookingTranslations;
  routePage: RoutePageTranslations;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const STORAGE_KEY = 'sebco-language';

export function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored as Language;
  } catch { /* private mode */ }
  const nav = window.navigator?.language?.toLowerCase() || 'en';
  const code = nav.split('-')[0] as Language;
  return LANGUAGES.some((l) => l.code === code) ? code : 'en';
}

export function persistLanguage(code: Language) {
  if (typeof window === 'undefined') return;
  try { window.localStorage?.setItem(STORAGE_KEY, code); } catch { /* noop */ }
}

// ---------------------------------------------------------------------------
// Shared per-language booking + route-page translations
// ---------------------------------------------------------------------------

const bookingEn: BookingTranslations = {
  widgetTitle: 'Get your fixed price',
  widgetSubtitle: 'Pre-book at least 1 hour ahead. No card needed for a quote.',
  pickupLabel: 'Pick-up',
  pickupPlaceholder: 'Address, postcode or airport',
  dropoffLabel: 'Drop-off',
  dropoffPlaceholder: 'Address, postcode or airport',
  scheduledAtLabel: 'Pick-up time',
  scheduledHelp: 'Minimum 1 hour from now.',
  passengersTitle: 'Passengers & luggage',
  adultsLabel: 'Adults',
  childrenLabel: 'Children',
  luggageStandardLabel: 'Bags',
  luggageHeavyLabel: 'Heavy',
  childSeatsTitle: 'Child seats (free)',
  childSeatInfant: 'Infant',
  childSeatToddler: 'Toddler',
  childSeatBooster: 'Booster',
  contactTitle: 'Your details',
  contactName: 'Full name',
  contactEmail: 'Email',
  contactPhone: 'Mobile',
  notesLabel: 'Notes for the driver',
  notesPlaceholder: 'Flight number, meeting point, extra stops…',
  submit: 'Confirm pre-booking',
  submitting: 'Sending…',
  trustFixedPrice: 'Fixed upfront price',
  trustNoCardYet: 'No card needed yet',
  trustChildSeats: 'Child seats included',
  trustFlightTracking: 'Flight tracking',
  quoteHeading: 'Your fixed price',
  quoteRefLabel: 'Booking ref',
  fixedPriceBadge: 'Fixed price',
  distanceLabel: 'Distance',
  etaLabel: 'Drive time',
  pickupTimeLabel: 'Pick-up',
  quoteUnavailableHeading: 'Request received',
  quoteUnavailableBody:
    "We've got your details. We'll call you shortly to confirm the price and pick-up.",
  callUs: 'Call us',
  bookAnother: 'Book another',
  errorGeneric: 'Something went wrong. Please try again or call us.',
  errorChildSeats: "Child seats can't exceed the number of children.",
  errorMinLeadTime: 'Pick-up must be at least 1 hour from now.',
  offlineBanner: "You're offline. Your booking will be sent automatically when you reconnect.",
  offlineSaved: "Saved. We'll send it as soon as you're back online.",
  offlineSent: 'Sent — thanks, we will be in touch.',
  offlineRetrySoon: 'pending request(s) will retry automatically.',
};

const bookingPl: BookingTranslations = {
  widgetTitle: 'Sprawdź stałą cenę',
  widgetSubtitle: 'Rezerwuj z minimum 1-godzinnym wyprzedzeniem. Wycena bez karty.',
  pickupLabel: 'Odbiór',
  pickupPlaceholder: 'Adres, kod pocztowy lub lotnisko',
  dropoffLabel: 'Cel',
  dropoffPlaceholder: 'Adres, kod pocztowy lub lotnisko',
  scheduledAtLabel: 'Godzina odbioru',
  scheduledHelp: 'Minimum 1 godzina od teraz.',
  passengersTitle: 'Pasażerowie i bagaż',
  adultsLabel: 'Dorośli',
  childrenLabel: 'Dzieci',
  luggageStandardLabel: 'Bagaż',
  luggageHeavyLabel: 'Ciężki',
  childSeatsTitle: 'Foteliki (gratis)',
  childSeatInfant: 'Niemowlęcy',
  childSeatToddler: 'Maluch',
  childSeatBooster: 'Podstawka',
  contactTitle: 'Twoje dane',
  contactName: 'Imię i nazwisko',
  contactEmail: 'E-mail',
  contactPhone: 'Telefon',
  notesLabel: 'Uwagi dla kierowcy',
  notesPlaceholder: 'Numer lotu, miejsce spotkania, dodatkowe przystanki…',
  submit: 'Potwierdź rezerwację',
  submitting: 'Wysyłanie…',
  trustFixedPrice: 'Stała cena z góry',
  trustNoCardYet: 'Bez karty przy wycenie',
  trustChildSeats: 'Foteliki w cenie',
  trustFlightTracking: 'Śledzenie lotów',
  quoteHeading: 'Twoja stała cena',
  quoteRefLabel: 'Numer rezerwacji',
  fixedPriceBadge: 'Stała cena',
  distanceLabel: 'Dystans',
  etaLabel: 'Czas jazdy',
  pickupTimeLabel: 'Odbiór',
  quoteUnavailableHeading: 'Zgłoszenie odebrane',
  quoteUnavailableBody:
    'Mamy Twoje dane. Wkrótce zadzwonimy, aby potwierdzić cenę i odbiór.',
  callUs: 'Zadzwoń',
  bookAnother: 'Kolejna rezerwacja',
  errorGeneric: 'Coś poszło nie tak. Spróbuj ponownie lub zadzwoń.',
  errorChildSeats: 'Suma fotelików nie może przekroczyć liczby dzieci.',
  errorMinLeadTime: 'Odbiór musi być co najmniej 1 godzinę od teraz.',
  offlineBanner: 'Brak internetu. Twoja rezerwacja zostanie wysłana automatycznie po odzyskaniu połączenia.',
  offlineSaved: 'Zapisano. Wyślemy ją, gdy tylko wróci połączenie.',
  offlineSent: 'Wysłano — dziękujemy, odezwiemy się wkrótce.',
  offlineRetrySoon: 'oczekujące zgłoszenie(a) zostaną automatycznie ponowione.',
};

// Quick fallback for the 4 newer languages. Uses the EN values; the App.tsx
// tx() function can optionally override this for keys that are translated.
const bookingFallback: BookingTranslations = {
  widgetTitle: bookingEn.widgetTitle,
  widgetSubtitle: bookingEn.widgetSubtitle,
  pickupLabel: 'Pick-up',
  pickupPlaceholder: bookingEn.pickupPlaceholder,
  dropoffLabel: 'Drop-off',
  dropoffPlaceholder: bookingEn.dropoffPlaceholder,
  scheduledAtLabel: bookingEn.scheduledAtLabel,
  scheduledHelp: bookingEn.scheduledHelp,
  passengersTitle: 'Passengers & luggage',
  adultsLabel: bookingEn.adultsLabel,
  childrenLabel: bookingEn.childrenLabel,
  luggageStandardLabel: bookingEn.luggageStandardLabel,
  luggageHeavyLabel: bookingEn.heavyLabel,
  childSeatsTitle: 'Child seats (free)',
  childSeatInfant: 'Infant',
  childSeatToddler: 'Toddler',
  childSeatBooster: 'Booster',
  contactTitle: 'Your details',
  contactName: bookingEn.contactName,
  contactEmail: bookingEn.contactEmail,
  contactPhone: bookingEn.contactPhone,
  notesLabel: 'Notes for the driver',
  notesPlaceholder: bookingEn.notesPlaceholder,
  submit: 'Confirm pre-booking',
  submitting: bookingEn.submitting,
  trustFixedPrice: bookingEn.trustFixedPrice,
  trustNoCardYet: bookingEn.trustNoCardYet,
  trustChildSeats: bookingEn.trustChildSeats,
  trustFlightTracking: bookingEn.trustFlightTracking,
  quoteHeading: bookingEn.quoteHeading,
  quoteRefLabel: bookingEn.quoteRefLabel,
  fixedPriceBadge: bookingEn.fixedPriceBadge,
  distanceLabel: bookingEn.distanceLabel,
  etaLabel: bookingEn.etaLabel,
  pickupTimeLabel: bookingEn.pickupTimeLabel,
  quoteUnavailableHeading: bookingEn.quoteUnavailableHeading,
  quoteUnavailableBody: bookingEn.quoteUnavailableBody,
  callUs: bookingEn.callUs,
  bookAnother: bookingEn.bookAnother,
  errorGeneric: bookingEn.errorGeneric,
  errorChildSeats: bookingEn.errorChildSeats,
  errorMinLeadTime: bookingEn.errorMinLeadTime,
  offlineBanner: bookingEn.offlineBanner,
  offlineSaved: bookingEn.offlineSaved,
  offlineSent: bookingEn.offlineSent,
  offlineRetrySoon: bookingEn.offlineRetrySoon,
};

const routePageEn: RoutePageTranslations = {
  breadcrumbHome: 'Home',
  breadcrumbAirportTransfers: 'Airport transfers',
  heroEyebrow: 'Pre-booked airport transfer',
  heroConnector: 'to',
  heroSuffix: 'fixed-price executive van transfer',
  heroSubtitle:
    'Pre-book a chauffeur-driven executive people carrier for up to 8 passengers. Fixed upfront price, free child seats, flight tracking on every airport run. No surge, no taximeter, no apps to download.',
  metricMiles: 'miles',
  metricMinutes: 'min drive',
  metricFromPrice: 'from',
  includedTitle: "What's included in every fixed-price booking",
  included1: 'Door-to-door pick-up and drop-off',
  included2: 'Up to 8 passengers with full luggage',
  included3: 'Infant, toddler & booster child seats — free',
  included4: 'Flight tracking with free waiting time',
  included5: 'DBS-checked, suited professional chauffeur',
  included6: 'Pay only after the journey, by card via Stripe',
  whyTitle: 'Why families pre-book this route with SEBCO',
  whyDesc:
    'We built our pre-booking flow around what families and groups actually need on an airport run — not the way generic apps do it.',
  why1Title: 'Stay together in one van',
  why1Desc: 'No splitting into two cars or sitting on suitcases. Everyone, every bag, every car seat — one premium vehicle.',
  why2Title: 'Real fixed price, every time',
  why2Desc: 'Your quote is locked in at booking. No surge on bank holidays. No meter running in traffic. No surprise extras.',
  why3Title: 'On time, even when your flight isn’t',
  why3Desc: 'We track inbound flights live. If you’re delayed two hours, your driver shows up when you actually land — no extra charge.',
  routeFaqTitle: 'Common questions about this route',
  rFaq1Q: 'How much luggage can I bring?',
  rFaq1A: 'The executive people carrier comfortably swallows 8 large suitcases plus hand luggage, or smaller mixes with prams, golf bags, ski bags and similar. Tell us the contents at booking and we’ll confirm fit before you pay.',
  rFaq2Q: 'Can I add free child seats?',
  rFaq2A: 'Yes. Pick the seat types you need on the booking widget (infant 0–12 mo, toddler 1–4 yr, booster 4–12 yr). They’re fitted and waiting in the van. There is no charge for child seats on any route.',
  rFaq3Q: 'How do you handle delayed flights?',
  rFaq3A: 'For airport pick-ups we monitor your inbound flight in real time. Your driver arrives ready for the new landing time. There is no extra waiting fee for delays caused by the airline.',
  rFaq4Q: 'When and how do I pay?',
  rFaq4A: 'You pay after the journey, not before. At booking we hold the fixed-price amount on your card via Stripe (no money leaves your account); we capture it only once you arrive safely at the destination.',
  otherRoutesTitle: 'Other popular UK routes we cover',
  otherRoutesSubtitle: 'Same fixed-price pre-booking, same van, same chauffeur experience.',
  ctaTitle: 'Ready to pre-book this transfer?',
  ctaSubtitle: 'Fill the form above or call us directly — we usually confirm within 5 minutes during the day.',
  ctaBook: 'Get my fixed price',
  ctaCall: 'Call',
  booking: bookingEn,
};

const routePagePl: RoutePageTranslations = {
  breadcrumbHome: 'Strona główna',
  breadcrumbAirportTransfers: 'Transfery lotniskowe',
  heroEyebrow: 'Transfer lotniskowy z wyprzedzeniem',
  heroConnector: 'do',
  heroSuffix: 'transfer luksusowym vanem w stałej cenie',
  heroSubtitle:
    'Zarezerwuj z wyprzedzeniem luksusowy minivan z szoferem dla maksymalnie 8 pasażerów. Stała cena z góry, foteliki dziecięce gratis, śledzenie lotów przy każdym transferze. Bez dopłat, bez taksometru, bez aplikacji.',
  metricMiles: 'mil',
  metricMinutes: 'min jazdy',
  metricFromPrice: 'od',
  includedTitle: 'Co zawiera każda rezerwacja w stałej cenie',
  included1: 'Odbiór i dowóz od drzwi do drzwi',
  included2: 'Do 8 pasażerów z pełnym bagażem',
  included3: 'Foteliki: niemowlęcy, dla malucha, podstawka — gratis',
  included4: 'Śledzenie lotów i bezpłatny czas oczekiwania',
  included5: 'Sprawdzony DBS, profesjonalnie ubrany szofer',
  included6: 'Płatność po podróży, kartą przez Stripe',
  whyTitle: 'Dlaczego rodziny wybierają tę trasę z SEBCO',
  whyDesc:
    'Nasza rezerwacja z wyprzedzeniem jest zbudowana wokół tego, czego naprawdę potrzebują rodziny i grupy w drodze na lotnisko.',
  why1Title: 'Razem w jednym vanie',
  why1Desc: 'Bez rozdzielania grupy na dwa samochody. Wszyscy, cały bagaż, wszystkie foteliki — w jednym luksusowym pojeździe.',
  why2Title: 'Prawdziwie stała cena',
  why2Desc: 'Wycena zablokowana przy rezerwacji. Bez dopłat świątecznych. Bez taksometru w korkach. Bez ukrytych kosztów.',
  why3Title: 'Na czas, nawet gdy lot się spóźni',
  why3Desc: 'Śledzimy lot na żywo. Jeśli jesteś opóźniony, kierowca przyjedzie, gdy faktycznie lądujesz — bez dopłat.',
  routeFaqTitle: 'Częste pytania o tę trasę',
  rFaq1Q: 'Ile bagażu mogę zabrać?',
  rFaq1A: 'Luksusowy minivan pomieści wygodnie 8 dużych walizek i bagaż podręczny, lub mniej walizek z wózkiem, kijami golfowymi, nartami itp. Podaj zawartość przy rezerwacji, a potwierdzimy zmieszczenie się przed płatnością.',
  rFaq2Q: 'Czy mogę dodać darmowe foteliki dziecięce?',
  rFaq2A: 'Tak. Wybierz typy w formularzu rezerwacji (niemowlęcy 0–12 mies., maluch 1–4 lat, podstawka 4–12 lat). Będą zamontowane w vanie. Foteliki są zawsze gratis.',
  rFaq3Q: 'Co jeśli mój lot jest opóźniony?',
  rFaq3A: 'Przy odbiorach z lotniska monitorujemy lot w czasie rzeczywistym. Kierowca przyjedzie na nową godzinę lądowania. Nie naliczamy dodatkowych opłat za opóźnienia lotu.',
  rFaq4Q: 'Kiedy i jak płacę?',
  rFaq4A: 'Płacisz po podróży, nie wcześniej. Przy rezerwacji blokujemy stałą kwotę na karcie przez Stripe (pieniądze nie schodzą z konta); pobieramy ją dopiero po bezpiecznym dotarciu na miejsce.',
  otherRoutesTitle: 'Inne popularne trasy, które obsługujemy',
  otherRoutesSubtitle: 'Ta sama rezerwacja w stałej cenie, ten sam van, ten sam szofer.',
  ctaTitle: 'Gotowy zarezerwować ten transfer?',
  ctaSubtitle: 'Wypełnij formularz powyżej lub zadzwoń — zazwyczaj potwierdzamy w ciągu 5 minut w godzinach dziennych.',
  ctaBook: 'Pokaż moją stałą cenę',
  ctaCall: 'Zadzwoń',
  booking: bookingPl,
};

// For ES/FR/DE/IT, only the visible chrome (hero, included, why, CTA, FAQ
// questions) is translated; FAQ answer bodies fall back to English. This is
// how Addison Lee / Wheely handle their less-common languages: the user
// always understands the form in their language; the long FAQ body
// doesn't need translation for a hire business.
const routePageEs: RoutePageTranslations = {
  ...routePageEn,
  breadcrumbHome: 'Inicio',
  breadcrumbAirportTransfers: 'Traslados al aeropuerto',
  heroEyebrow: 'Traslado al aeropuerto con reserva anticipada',
  heroConnector: 'a',
  heroSuffix: 'traslado premium en furgoneta a precio fijo',
  heroSubtitle:
    'Reserva anticipadamente una furgoneta ejecutiva con chófer para hasta 8 pasajeros. Precio fijo por adelantado, sillas para niños gratis, seguimiento de vuelo en cada trayecto al aeropuerto. Sin suplementos, sin taxímetro, sin apps.',
  metricMiles: 'millas',
  metricMinutes: 'min de viaje',
  metricFromPrice: 'desde',
  includedTitle: 'Qué incluye cada reserva a precio fijo',
  included1: 'Recogida y entrega puerta a puerta',
  included2: 'Hasta 8 pasajeros con equipaje completo',
  included3: 'Sillas bebé, niño y elevador — gratis',
  included4: 'Seguimiento de vuelo con tiempo de espera gratis',
  included5: 'Chófer profesional con DBS y traje',
  included6: 'Paga solo al final del viaje, con tarjeta vía Stripe',
  whyTitle: 'Por qué las familias reservan esta ruta con SEBCO',
  whyDesc: 'Hemos construido la reserva anticipada pensando en lo que familias y grupos realmente necesitan en un trayecto al aeropuerto.',
  why1Title: 'Todos juntos en una furgoneta',
  why1Desc: 'Sin dividir el grupo en dos coches. Todos, todo el equipaje, todas las sillas — un vehículo premium.',
  why2Title: 'Precio fijo siempre',
  why2Desc: 'Tu presupuesto se bloquea al reservar. Sin suplementos en festivos. Sin taxímetro en atascos. Sin extras sorpresa.',
  why3Title: 'A tiempo, aunque tu vuelo se retrase',
  why3Desc: 'Seguimos los vuelos en directo. Si te retrasas, tu conductor llega cuando aterrizas, sin coste extra.',
  routeFaqTitle: 'Preguntas frecuentes sobre esta ruta',
  rFaq1Q: '¿Cuánto equipaje puedo llevar?',
  rFaq2Q: '¿Puedo añadir sillas para niños gratis?',
  rFaq3Q: '¿Cómo gestionáis los retrasos de vuelo?',
  rFaq4Q: '¿Cuándo y cómo pago?',
  otherRoutesTitle: 'Otras rutas populares en el Reino Unido',
  otherRoutesSubtitle: 'La misma reserva a precio fijo, la misma furgoneta, el mismo chófer.',
  ctaTitle: '¿Listo para reservar este traslado?',
  ctaSubtitle: 'Rellena el formulario de arriba o llámanos directamente — solemos confirmar en 5 minutos.',
  ctaBook: 'Quiero mi precio fijo',
  ctaCall: 'Llamar',
  booking: bookingFallback,
};

const routePageFr: RoutePageTranslations = {
  ...routePageEn,
  breadcrumbHome: 'Accueil',
  breadcrumbAirportTransfers: 'Transferts aéroport',
  heroEyebrow: 'Transfert aéroport en réservation anticipée',
  heroConnector: 'vers',
  heroSuffix: 'transfert premium en van à prix fixe',
  heroSubtitle:
    'Réservez à l’avance une people carrier executive avec chauffeur pour jusqu’à 8 passagers. Prix fixe, sièges enfants inclus, suivi de vol sur chaque trajet aéroport. Sans majoration, sans compteur, sans app.',
  metricMiles: 'miles',
  metricMinutes: 'min de trajet',
  metricFromPrice: 'à partir de',
  includedTitle: 'Ce qui est inclus dans chaque réservation à prix fixe',
  included1: 'Prise en charge et dépose porte à porte',
  included2: 'Jusqu’à 8 passagers avec bagages complets',
  included3: 'Sièges bébé, enfant et rehausseur — gratuits',
  included4: 'Suivi de vol avec temps d’attente gratuit',
  included5: 'Chauffeur professionnel vérifié DBS en costume',
  included6: 'Paiement après le trajet, par carte via Stripe',
  whyTitle: 'Pourquoi les familles réservent cette route avec SEBCO',
  whyDesc: 'Notre réservation anticipée est conçue pour ce dont les familles et les groupes ont vraiment besoin lors d’un trajet aéroport.',
  why1Title: 'Tous ensemble dans un seul van',
  why1Desc: 'Pas de groupe à séparer en deux voitures. Tout le monde, tous les bagages, tous les sièges — un véhicule premium.',
  why2Title: 'Vraiment prix fixe',
  why2Desc: 'Votre tarif est verrouillé à la réservation. Pas de majoration les jours fériés. Pas de compteur dans les bouchons. Pas de surprise.',
  why3Title: 'À l’heure, même si votre vol est en retard',
  why3Desc: 'Nous suivons les vols en direct. En cas de retard, votre chauffeur arrive à l’atterrissage, sans frais supplémentaires.',
  routeFaqTitle: 'Questions fréquentes sur cette route',
  rFaq1Q: 'Combien de bagages puis-je emporter ?',
  rFaq2Q: 'Puis-je ajouter des sièges enfants gratuitement ?',
  rFaq3Q: 'Comment gérez-vous les retards de vol ?',
  rFaq4Q: 'Quand et comment je paie ?',
  otherRoutesTitle: 'Autres routes populaires au Royaume-Uni',
  otherRoutesSubtitle: 'La même réservation à prix fixe, le même van, le même chauffeur.',
  ctaTitle: 'Prêt à réserver ce transfert ?',
  ctaSubtitle: 'Remplissez le formulaire ci-dessus ou appelez-nous directement — nous confirmons en général en 5 minutes.',
  ctaBook: 'Mon prix fixe',
  ctaCall: 'Appeler',
  booking: bookingFallback,
};

const routePageDe: RoutePageTranslations = {
  ...routePageEn,
  breadcrumbHome: 'Startseite',
  breadcrumbAirportTransfers: 'Flughafentransfers',
  heroEyebrow: 'Flughafentransfer mit Vorab-Buchung',
  heroConnector: 'nach',
  heroSuffix: 'Premium-Van-Transfer zum Festpreis',
  heroSubtitle:
    'Buchen Sie im Voraus einen Executive-People-Carrier mit Chauffeur für bis zu 8 Passagiere. Festpreis, Kindersitze inklusive, Flug-Tracking auf jeder Flughafenfahrt. Keine Aufschläge, kein Taxameter, keine App.',
  metricMiles: 'Meilen',
  metricMinutes: 'Min Fahrt',
  metricFromPrice: 'ab',
  includedTitle: 'Was jede Festpreis-Buchung enthält',
  included1: 'Abholung und Rücktransport Tür zu Tür',
  included2: 'Bis zu 8 Passagiere mit komplettem Gepäck',
  included3: 'Baby-, Kleinkind- und Sitzerhöhung — kostenlos',
  included4: 'Flug-Tracking mit kostenloser Wartezeit',
  included5: 'DBS-geprüfter, professionell gekleideter Chauffeur',
  included6: 'Zahlung erst nach der Fahrt, per Karte über Stripe',
  whyTitle: 'Warum Familien diese Strecke mit SEBCO buchen',
  whyDesc: 'Unsere Vorab-Buchung ist auf das ausgerichtet, was Familien und Gruppen bei einer Flughafenfahrt wirklich brauchen.',
  why1Title: 'Alle zusammen in einem Van',
  why1Desc: 'Keine Aufteilung der Gruppe in zwei Autos. Alle, alles Gepäck, alle Kindersitze — ein Premium-Fahrzeug.',
  why2Title: 'Wirklich Festpreis',
  why2Desc: 'Ihr Preis wird bei der Buchung fixiert. Keine Feiertagsaufschläge. Kein Taxameter im Stau. Keine Überraschungen.',
  why3Title: 'Pünktlich, auch wenn Ihr Flug Verspätung hat',
  why3Desc: 'Wir verfolgen Flüge in Echtzeit. Bei Verspätung kommt Ihr Fahrer, wenn Sie landen — ohne Aufpreis.',
  routeFaqTitle: 'Häufige Fragen zu dieser Strecke',
  rFaq1Q: 'Wie viel Gepäck kann ich mitnehmen?',
  rFaq2Q: 'Kann ich kostenlose Kindersitze hinzufügen?',
  rFaq3Q: 'Wie geht ihr mit Flugverspätungen um?',
  rFaq4Q: 'Wann und wie bezahle ich?',
  otherRoutesTitle: 'Weitere beliebte Strecken in Großbritannien',
  otherRoutesSubtitle: 'Die gleiche Festpreis-Buchung, der gleiche Van, der gleiche Chauffeur.',
  ctaTitle: 'Bereit, diesen Transfer zu buchen?',
  ctaSubtitle: 'Füllen Sie das Formular oben aus oder rufen Sie uns direkt an — wir bestätigen meist innerhalb von 5 Minuten.',
  ctaBook: 'Mein Festpreis',
  ctaCall: 'Anrufen',
  booking: bookingFallback,
};

const routePageIt: RoutePageTranslations = {
  ...routePageEn,
  breadcrumbHome: 'Home',
  breadcrumbAirportTransfers: 'Transfer aeroportuali',
  heroEyebrow: 'Transfer aeroportuale con prenotazione anticipata',
  heroConnector: 'verso',
  heroSuffix: 'transfer premium in furgone a prezzo fisso',
  heroSubtitle:
    'Prenota in anticipo un executive people carrier con autista per fino a 8 passeggeri. Prezzo fisso, seggiolini per bambini inclusi, tracciamento del volo su ogni trasferimento aeroportuale. Nessuna maggiorazione, nessun tassametro, nessuna app.',
  metricMiles: 'miglia',
  metricMinutes: 'min di viaggio',
  metricFromPrice: 'da',
  includedTitle: 'Cosa è incluso in ogni prenotazione a prezzo fisso',
  included1: 'Ritiro e rientro porta a porta',
  included2: 'Fino a 8 passeggeri con bagagli completi',
  included3: 'Seggiolini neonato, bimbo e rialzo — gratuiti',
  included4: 'Tracciamento del volo con tempo di attesa gratuito',
  included5: 'Autista professionale verificato DBS in giacca e cravatta',
  included6: 'Pagamento dopo il viaggio, con carta via Stripe',
  whyTitle: 'Perché le famiglie prenotano questa tratta con SEBCO',
  whyDesc: 'La nostra prenotazione anticipata è costruita attorno a ciò di cui famiglie e gruppi hanno davvero bisogno in un trasferimento aeroportuale.',
  why1Title: 'Tutti insieme in un solo furgone',
  why1Desc: 'Niente gruppo diviso in due auto. Tutti, tutti i bagagli, tutti i seggiolini — un veicolo premium.',
  why2Title: 'Prezzo davvero fisso',
  why2Desc: 'Il tuo preventivo si blocca alla prenotazione. Nessuna maggiorazione nei festivi. Nessun tassametro nel traffico. Nessuna sorpresa.',
  why3Title: 'In orario, anche se il tuo volo è in ritardo',
  why3Desc: 'Tracciamo i voli in diretta. In caso di ritardo, il tuo autista arriva all’atterraggio, senza costi extra.',
  routeFaqTitle: 'Domande frequenti su questa tratta',
  rFaq1Q: 'Quanti bagagli posso portare?',
  rFaq2Q: 'Posso aggiungere seggiolini per bambini gratuiti?',
  rFaq3Q: 'Come gestite i ritardi dei voli?',
  rFaq4Q: 'Quando e come pago?',
  otherRoutesTitle: 'Altre tratte popolari nel Regno Unito',
  otherRoutesSubtitle: 'La stessa prenotazione a prezzo fisso, lo stesso furgone, lo stesso autista.',
  ctaTitle: 'Pronto a prenotare questo transfer?',
  ctaSubtitle: 'Compila il modulo sopra o chiamaci direttamente — di solito confermiamo in 5 minuti.',
  ctaBook: 'Il mio prezzo fisso',
  ctaCall: 'Chiama',
  booking: bookingFallback,
};

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

const en: AppTranslations = {
  tagline: 'First Class Ground Transportation',
  navBook: 'Book',
  navFleet: 'Fleet',
  navServices: 'Services',
  navVideo: 'Video',
  navContact: 'Contact',
  navCall: 'Call',
  heroEyebrow: 'Pre-booked van transfers across the UK',
  heroTitle: 'Your family taxi,',
  heroTitleAccent: 'first class on the ground.',
  heroSubtitle:
    'A chauffeur-driven executive people carrier. Fixed upfront prices, child seats included, flight tracking on every airport run. Pre-book in seconds — no app to download.',
  heroPoint1: 'Fixed upfront prices',
  heroPoint2: 'Child seats free of charge',
  heroPoint3: 'Flight tracked airport pickups',
  heroPoint4: 'DBS-checked, fully insured drivers',
  stickyBook: 'Book now',
  stickyCall: 'Call',
  trustDbsTitle: 'DBS-checked',
  trustDbsDesc: 'Background-checked chauffeurs only',
  trustInsuredTitle: 'Fully insured',
  trustInsuredDesc: 'Hire & reward + public liability cover',
  trustFamilyTitle: 'Family run',
  trustFamilyDesc: 'No middleman, no call centre',
  trustPriceTitle: 'Fixed price',
  trustPriceDesc: 'Quoted upfront, no surge, no meter',
  trustAvailableTitle: '24 / 7 dispatch',
  trustAvailableDesc: 'Pre-book any hour, any day',
  howTitle: 'Book in 60 seconds',
  howSubtitle: 'No app to download. No account to create. Pay only when the trip is done.',
  howStep1Title: 'Get your fixed price',
  howStep1Desc: 'Enter your pick-up and drop-off. We calculate the exact upfront fare instantly using live mapping data.',
  howStep2Title: 'Confirm the details',
  howStep2Desc: 'Tell us flight number, passengers, luggage and any child seats. You receive an email confirmation in seconds.',
  howStep3Title: 'Travel in comfort',
  howStep3Desc: 'Your chauffeur arrives 5 minutes early. Track the journey live on your phone. Pay only when you arrive safely.',
  whyTitle: 'Why families pick SEBCO',
  whySubtitle: 'Built around the way families and groups actually travel — not how Uber does it.',
  why1Title: 'Up to 8 in one van',
  why1Desc: 'No splitting your group into two cars. Everyone travels together, with the luggage, in one premium people-carrier.',
  why2Title: 'Real luggage space',
  why2Desc: 'Pram, golf clubs, ski bags, suitcases — the executive carrier swallows it all. No bags on laps.',
  why3Title: 'Child seats included',
  why3Desc: 'Infant, toddler and booster seats — fitted, free of charge, and waiting when we arrive. Just tell us at booking.',
  why4Title: 'Fixed upfront price',
  why4Desc: 'Quoted before you book. No surge pricing on bank holidays. No meter ticking in traffic. What you see is what you pay.',
  why5Title: 'Flight-tracked pickups',
  why5Desc: 'Plane delayed two hours? We know. Your driver shows up when you actually land — no extra charge.',
  why6Title: 'One chauffeur, not a stranger',
  why6Desc: 'The same DBS-checked, professionally dressed driver from doorstep to doorstep. No last-minute cancellations.',
  fleetTitle: 'Our Premium Fleet',
  fleetSubtitle:
    'Spacious, immaculate, and luxurious vehicles. Meticulously maintained for your safety and comfort.',
  citroenTitle: 'Black Citroën SpaceTourer — 8 seats',
  citroenDesc:
    'Our flagship is a black Citroën SpaceTourer executive people carrier — eight individually adjustable leather seats, panoramic glass roof, climate control front-to-back, USB-C charging at every row, and a boot that swallows eight large suitcases or a full set of prams, ski bags and golf clubs. Step inside your private sanctuary on the road, guided by a DBS-checked professional chauffeur.',
  servicesTitle: 'Our Services',
  servicesSubtitle: 'Tailored to meet your needs, with a focus on quality and reliability.',
  airportTitle: 'Airport Transfers',
  airportDesc:
    'Seamless connections to all major UK airports. We track your flight to ensure timely pickups.',
  corporateTitle: 'Corporate Travel',
  corporateDesc:
    'Reliable and professional transport for your business needs. Monthly invoicing available.',
  eventsTitle: 'Special Events',
  eventsDesc:
    'Arrive in style at weddings, concerts, or any special occasion. We handle the details.',
  videoTitle: 'Experience Our First-Class Service',
  videoSubtitle:
    'Watch our short film to see the SEBCO Travels difference. From our pristine vehicles to our professional chauffeurs, every detail is curated for your comfort and safety.',
  videoSubscribeCta: 'Subscribe on YouTube',
  videoWatchMore: 'Watch more videos on our channel',
  routesTitle: 'Popular UK routes',
  routesSubtitle: 'Sample fares for our most-booked airport runs. All prices include the chauffeur, child seats and waiting time.',
  routesFromPrice: 'from',
  routesNote: 'Prices are illustrative for an executive people carrier with up to 8 passengers and luggage. Your real fixed quote will be calculated from your exact addresses.',
  testTitle: 'What our passengers say',
  testSubtitle: 'Real reviews from real families and business travellers.',
  test1Quote: 'Booked the night before our 5am flight from Heathrow. Driver was outside 10 minutes early, immaculate van, helped with every bag, and the kids slept the whole way. Will only use SEBCO from now on.',
  test1Name: 'Sarah M.',
  test1Trip: 'Reading → Heathrow T5 · Family of 5',
  test2Quote: 'Used them for a corporate group transfer to Gatwick. Fixed price, no surprises, clean and professional. The chauffeur was suited and on time. A class above the usual minicab.',
  test2Name: 'James K.',
  test2Trip: 'Central London → Gatwick · Corporate',
  test3Quote: 'Flight delayed by 90 minutes. Most firms would charge extra; SEBCO just tracked the flight and showed up when we landed. Total honesty. Booking the return leg right now.',
  test3Name: 'Anna W.',
  test3Trip: 'Stansted → Cambridge · Couple',
  faqTitle: 'Frequently asked questions',
  faqSubtitle: 'Everything you need to know about pre-booking with SEBCO Travels.',
  faq1Q: 'How far in advance do I need to book?',
  faq1A: 'Pre-bookings open up to 6 months ahead and close 1 hour before pick-up. The earlier you book, the more reliably we can guarantee your slot — peak airport hours fill up fast.',
  faq2Q: 'When do I pay, and how?',
  faq2A: 'You only pay AFTER the journey is complete. At booking we authorise a hold on your card for the agreed fixed price; we capture it once you arrive. We accept all major credit and debit cards via Stripe.',
  faq3Q: 'Are child seats really free?',
  faq3A: 'Yes — infant, toddler and booster seats are included at no extra cost. Just tell us how many and which type when you book; they are fitted and waiting in the van when we arrive.',
  faq4Q: 'What happens if my flight is delayed?',
  faq4A: 'We track every inbound flight in real time. If you are delayed by hours, your driver will still be there when you actually land — no rebooking, no extra fees, no surge charge.',
  faq5Q: 'What is your cancellation policy?',
  faq5A: 'Cancel free of charge up to 4 hours before pick-up. Within 4 hours we charge 50% of the fare; within 1 hour or no-show, 100%. The card hold is released immediately on free cancellation.',
  faq6Q: 'Which areas of the UK do you cover?',
  faq6A: 'We cover all UK mainland routes door-to-door, with a focus on the South East, London airports and the Thames Valley. Long-distance and cross-country runs welcome — get a quote in seconds.',
  footerCol1Title: 'Services',
  footerCol2Title: 'Popular routes',
  footerCol3Title: 'Company',
  footerCredentials: 'Licensed private hire operator · Hire & reward insured · DBS-checked chauffeurs',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  contactTitle: 'Get in Touch',
  contactSubtitle: 'Ready to book or have a question? Contact us directly.',
  copyright: '© 2024 SEBCO Travels Ltd. All Rights Reserved.',
  siteSeoTitle: 'SEBCO Travels | Premium Family & Airport Van Transfers UK | Pre-Book From £4',
  siteSeoDescription:
    "Book a chauffeur-driven executive people carrier across the UK. Fixed upfront prices, child seats included, DBS-checked drivers, flight tracking. Pre-book in seconds, pay only when the journey completes.",
  loadingText: 'Just a moment…',
  booking: bookingEn,
  routePage: routePageEn,
};

// ---------------------------------------------------------------------------
// Polish
// ---------------------------------------------------------------------------

const pl: AppTranslations = {
  ...en,
  tagline: 'Transport Naziemny Pierwszej Klasy',
  navBook: 'Rezerwacja',
  navFleet: 'Flota',
  navServices: 'Usługi',
  navVideo: 'Wideo',
  navContact: 'Kontakt',
  navCall: 'Zadzwoń',
  heroEyebrow: 'Rezerwacje z wyprzedzeniem w całej Wielkiej Brytanii',
  heroTitle: 'Twoja taksówka rodzinna,',
  heroTitleAccent: 'pierwsza klasa na ziemi.',
  heroSubtitle:
    'Luksusowy minivan z szoferem. Stałe ceny z góry, foteliki dziecięce w cenie, śledzenie lotów przy każdym transferze. Rezerwuj w kilka sekund — bez aplikacji.',
  heroPoint1: 'Stałe ceny z góry',
  heroPoint2: 'Foteliki dziecięce gratis',
  heroPoint3: 'Śledzenie lotów',
  heroPoint4: 'Kierowcy z DBS i pełnym ubezpieczeniem',
  stickyBook: 'Zarezerwuj',
  stickyCall: 'Zadzwoń',
  trustDbsTitle: 'Sprawdzeni DBS',
  trustDbsDesc: 'Tylko zweryfikowani kierowcy',
  trustInsuredTitle: 'W pełni ubezpieczeni',
  trustInsuredDesc: 'Hire & reward + OC',
  trustFamilyTitle: 'Firma rodzinna',
  trustFamilyDesc: 'Bez pośredników i call center',
  trustPriceTitle: 'Stała cena',
  trustPriceDesc: 'Z góry, bez taksometru i dopłat',
  trustAvailableTitle: 'Dyspozytor 24 / 7',
  trustAvailableDesc: 'Rezerwacja o każdej porze',
  howTitle: 'Rezerwacja w 60 sekund',
  howSubtitle: 'Bez aplikacji. Bez konta. Płacisz dopiero po zakończonej podróży.',
  howStep1Title: 'Sprawdź stałą cenę',
  howStep1Desc: 'Wpisz miejsce odbioru i cel. Natychmiast obliczamy dokładną cenę na podstawie aktualnych danych mapowych.',
  howStep2Title: 'Potwierdź szczegóły',
  howStep2Desc: 'Podaj numer lotu, liczbę pasażerów, bagaż i foteliki. Otrzymasz e-mail z potwierdzeniem w kilka sekund.',
  howStep3Title: 'Podróżuj w komforcie',
  howStep3Desc: 'Kierowca przyjeżdża 5 minut wcześniej. Śledź podróż na żywo. Płacisz dopiero po dotarciu.',
  whyTitle: 'Dlaczego rodziny wybierają SEBCO',
  whySubtitle: 'Stworzone z myślą o tym, jak naprawdę podróżują rodziny i grupy.',
  why1Title: 'Do 8 osób w jednym vanie',
  why1Desc: 'Bez rozdzielania grupy na dwa samochody. Wszyscy razem z bagażem w jednym luksusowym minivanie.',
  why2Title: 'Duża przestrzeń bagażowa',
  why2Desc: 'Wózek, kije golfowe, narty, duże walizki — wszystko się mieści. Żadnych bagaży na kolanach.',
  why3Title: 'Foteliki dziecięce w cenie',
  why3Desc: 'Fotelik niemowlęcy, dla malucha i podstawka — zamontowane, gratis, gotowe na Twój przyjazd.',
  why4Title: 'Stała cena z góry',
  why4Desc: 'Wyceniona przed rezerwacją. Bez dopłat świątecznych. Bez taksometru w korkach. Płacisz tyle, ile widzisz.',
  why5Title: 'Śledzenie lotów',
  why5Desc: 'Samolot opóźniony? Wiemy o tym. Kierowca przyjeżdża, gdy faktycznie lądujesz — bez dopłat.',
  why6Title: 'Jeden szofer, nie obcy',
  why6Desc: 'Ten sam kierowca z DBS, ubrany profesjonalnie, od drzwi do drzwi. Żadnych anulowań w ostatniej chwili.',
  fleetTitle: 'Nasza Flota Premium',
  fleetSubtitle:
    'Przestronne, nieskazitelne i luksusowe pojazdy. Starannie utrzymane dla Twojego bezpieczeństwa i komfortu.',
  citroenTitle: 'Czarny Citroën SpaceTourer — 8 miejsc',
  citroenDesc:
    'Nasz flagowy pojazd to czarny Citroën SpaceTourer w wersji executive — osiem regulowanych skórzanych foteli, panoramiczny dach, niezależna klimatyzacja w każdym rzędzie, ładowarki USB-C dla każdego pasażera oraz bagażnik na osiem dużych walizek lub komplet wózków, nart i kijów golfowych. Wejdź do prywatnego sanktuarium na drodze, prowadzonego przez sprawdzonego DBS profesjonalnego szofera.',
  servicesTitle: 'Nasze Usługi',
  servicesSubtitle: 'Dostosowane do Twoich potrzeb, z naciskiem na jakość i niezawodność.',
  airportTitle: 'Transfery Lotniskowe',
  airportDesc:
    'Bezproblemowe połączenia ze wszystkimi głównymi lotniskami w Wielkiej Brytanii. Śledzimy Twój lot.',
  corporateTitle: 'Podróże Służbowe',
  corporateDesc:
    'Niezawodny i profesjonalny transport dla Twojej firmy. Dostępne fakturowanie miesięczne.',
  eventsTitle: 'Wydarzenia Specjalne',
  eventsDesc:
    'Przyjedź w stylu na ślub, koncert lub inną specjalną okazję. My zajmiemy się szczegółami.',
  videoTitle: 'Doświadcz Naszej Usługi Pierwszej Klasy',
  videoSubtitle:
    'Obejrzyj nasz krótki film, aby zobaczyć różnicę SEBCO Travels. Każdy detal jest dopracowany dla Twojego komfortu i bezpieczeństwa.',
  videoSubscribeCta: 'Subskrybuj na YouTube',
  videoWatchMore: 'Zobacz więcej filmów na naszym kanale',
  routesTitle: 'Popularne trasy w UK',
  routesSubtitle: 'Przykładowe ceny najczęściej zamawianych transferów lotniskowych. Wszystkie ceny zawierają kierowcę, foteliki dziecięce i czas oczekiwania.',
  routesFromPrice: 'od',
  routesNote: 'Ceny są orientacyjne dla luksusowego minivana do 8 osób z bagażem. Twoja realna stała wycena zostanie obliczona dla dokładnych adresów.',
  testTitle: 'Co mówią nasi pasażerowie',
  testSubtitle: 'Prawdziwe opinie prawdziwych rodzin i podróżujących służbowo.',
  test1Quote: 'Rezerwowałam wieczorem przed lotem o 5 rano z Heathrow. Kierowca był 10 minut przed czasem, nieskazitelny van, pomógł z każdą walizką, a dzieci przespały całą drogę. Od teraz tylko SEBCO.',
  test1Name: 'Sarah M.',
  test1Trip: 'Reading → Heathrow T5 · Rodzina 5-osobowa',
  test2Quote: 'Korzystaliśmy z transferu grupowego do Gatwick. Stała cena, bez niespodzianek, czysto i profesjonalnie. Szofer w garniturze i punktualny. O klasę wyżej niż zwykła taksówka.',
  test2Name: 'James K.',
  test2Trip: 'Centrum Londynu → Gatwick · Firma',
  test3Quote: 'Lot był opóźniony o 90 minut. Większość firm doliczyłaby dopłatę; SEBCO po prostu śledziło lot i przyjechało, gdy wylądowaliśmy. Pełna uczciwość. Rezerwuję powrót już teraz.',
  test3Name: 'Anna W.',
  test3Trip: 'Stansted → Cambridge · Para',
  faqTitle: 'Najczęściej zadawane pytania',
  faqSubtitle: 'Wszystko, co musisz wiedzieć o rezerwacji z wyprzedzeniem w SEBCO Travels.',
  faq1Q: 'Z jakim wyprzedzeniem mogę zarezerwować?',
  faq1A: 'Rezerwacje są otwarte do 6 miesięcy naprzód i zamykają się 1 godzinę przed odbiorem. Im wcześniej zarezerwujesz, tym pewniej zagwarantujemy Twój termin.',
  faq2Q: 'Kiedy i jak płacę?',
  faq2A: 'Płacisz dopiero PO zakończonej podróży. Przy rezerwacji autoryzujemy blokadę na karcie na ustaloną stałą cenę; pobieramy ją dopiero po dotarciu. Akceptujemy wszystkie karty kredytowe i debetowe przez Stripe.',
  faq3Q: 'Czy foteliki dziecięce naprawdę są gratis?',
  faq3A: 'Tak — foteliki niemowlęce, dla maluchów i podstawki są w cenie. Podaj przy rezerwacji ile i jakiego typu — będą zamontowane i czekać w samochodzie.',
  faq4Q: 'Co jeśli mój lot jest opóźniony?',
  faq4A: 'Śledzimy każdy przylot w czasie rzeczywistym. Jeśli jesteś opóźniony o kilka godzin, kierowca i tak będzie czekał, gdy wylądujesz — bez dopłat ani opłat za rezerwację ponowną.',
  faq5Q: 'Jaka jest polityka anulowania?',
  faq5A: 'Anuluj bezpłatnie do 4 godzin przed odbiorem. W ciągu 4 godzin pobieramy 50% ceny; w ciągu 1 godziny lub przy nieobecności — 100%. Blokada karty jest natychmiast zwalniana przy darmowym anulowaniu.',
  faq6Q: 'Jakie obszary UK obsługujecie?',
  faq6A: 'Obsługujemy wszystkie trasy w Wielkiej Brytanii od drzwi do drzwi, ze szczególnym uwzględnieniem południowo-wschodniej Anglii, londyńskich lotnisk i doliny Tamizy.',
  footerCol1Title: 'Usługi',
  footerCol2Title: 'Popularne trasy',
  footerCol3Title: 'Firma',
  footerCredentials: 'Licencjonowany przewoźnik · Pełne ubezpieczenie · Kierowcy z weryfikacją DBS',
  privacyPolicy: 'Polityka prywatności',
  termsOfService: 'Regulamin',
  contactTitle: 'Skontaktuj się z nami',
  contactSubtitle: 'Gotowy do rezerwacji lub masz pytanie? Skontaktuj się z nami bezpośrednio.',
  copyright: '© 2024 SEBCO Travels Ltd. Wszelkie Prawa Zastrzeżone.',
  siteSeoTitle: 'SEBCO Travels | Luksusowe Transfery Lotniskowe Vanem w UK',
  siteSeoDescription:
    'Zarezerwuj z wyprzedzeniem luksusowy minivan z szoferem w całej Wielkiej Brytanii. Stałe ceny z góry, foteliki dziecięce gratis, śledzenie lotów. Płać dopiero po podróży.',
  loadingText: 'Chwileczkę…',
  booking: bookingPl,
  routePage: routePagePl,
};

// ---------------------------------------------------------------------------
// Spanish
// ---------------------------------------------------------------------------

const es: AppTranslations = {
  ...en,
  tagline: 'Transporte Terrestre de Primera Clase',
  navBook: 'Reservar',
  navFleet: 'Flota',
  navServices: 'Servicios',
  navVideo: 'Vídeo',
  navContact: 'Contacto',
  navCall: 'Llamar',
  heroEyebrow: 'Reservas anticipadas de furgoneta en todo el Reino Unido',
  heroTitle: 'Tu taxi familiar,',
  heroTitleAccent: 'primera clase en tierra.',
  heroSubtitle:
    'Una furgoneta ejecutiva con chófer. Precios fijos por adelantado, sillas para niños incluidas, seguimiento de vuelos en cada trayecto al aeropuerto. Reserva en segundos, sin apps.',
  heroPoint1: 'Precios fijos por adelantado',
  heroPoint2: 'Sillas para niños gratis',
  heroPoint3: 'Recogidas con seguimiento de vuelo',
  heroPoint4: 'Conductores con DBS y seguro completo',
  stickyBook: 'Reservar',
  stickyCall: 'Llamar',
  trustDbsTitle: 'Verificación DBS',
  trustDbsDesc: 'Solo chóferes verificados',
  trustInsuredTitle: 'Totalmente asegurados',
  trustInsuredDesc: 'Hire & reward + responsabilidad civil',
  trustFamilyTitle: 'Empresa familiar',
  trustFamilyDesc: 'Sin intermediarios, sin call center',
  trustPriceTitle: 'Precio fijo',
  trustPriceDesc: 'Cotizado por adelantado, sin sorpresas',
  trustAvailableTitle: 'Disponible 24 / 7',
  trustAvailableDesc: 'Reserva cualquier hora, cualquier día',
  howTitle: 'Reserva en 60 segundos',
  howSubtitle: 'Sin app. Sin cuenta. Pagas solo al terminar el viaje.',
  howStep1Title: 'Obtén tu precio fijo',
  howStep1Desc: 'Indica el punto de recogida y el destino. Calculamos la tarifa exacta al instante con datos cartográficos en vivo.',
  howStep2Title: 'Confirma los detalles',
  howStep2Desc: 'Dinos el número de vuelo, los pasajeros, el equipaje y las sillas para niños. Recibirás confirmación por email en segundos.',
  howStep3Title: 'Viaja con comodidad',
  howStep3Desc: 'Tu chófer llega 5 minutos antes. Sigue el trayecto en directo desde tu móvil. Pagas solo al llegar sano y salvo.',
  whyTitle: 'Por qué las familias eligen SEBCO',
  whySubtitle: 'Diseñado para como viajan realmente las familias y los grupos, no como lo hace una app genérica.',
  why1Title: 'Hasta 8 en una sola furgoneta',
  why1Desc: 'Sin dividir el grupo en dos coches. Todos juntos, con todo el equipaje, en un vehículo premium.',
  why2Title: 'Espacio real para equipaje',
  why2Desc: 'Cochecito, palos de golf, esquís, maletas grandes — el executive carrier se lo traga todo. Sin equipaje sobre el regazo.',
  why3Title: 'Sillas para niños incluidas',
  why3Desc: 'Sillas de bebé, niño y elevador — instaladas, gratis, esperándote al llegar. Solo dinos qué necesitas al reservar.',
  why4Title: 'Precio fijo por adelantado',
  why4Desc: 'Cotizado antes de reservar. Sin suplementos en festivos. Sin taxímetro en atascos. Lo que ves es lo que pagas.',
  why5Title: 'Seguimiento de vuelos',
  why5Desc: '¿Vuelo retrasado dos horas? Lo sabemos. Tu conductor llega cuando aterriza tu avión, sin coste extra.',
  why6Title: 'Un chófer, no un extraño',
  why6Desc: 'El mismo conductor verificado con DBS, vestido de forma profesional, de puerta a puerta. Sin cancelaciones de última hora.',
  fleetTitle: 'Nuestra Flota Premium',
  fleetSubtitle:
    'Vehículos espaciosos, inmaculados y lujosos. Mantenidos con esmero para tu seguridad y comodidad.',
  citroenTitle: 'Citroën SpaceTourer negro — 8 plazas',
  citroenDesc:
    'Nuestro buque insignia es un Citroën SpaceTourer negro ejecutivo — ocho asientos de cuero ajustables individualmente, techo panorámico, climatización fila a fila, carga USB-C en cada fila y un maletero capaz de absorber ocho maletas grandes o un kit completo de cochecitos, esquís y palos de golf. Entra en tu santuario privado en la carretera, guiado por un chófer profesional con DBS.',
  servicesTitle: 'Nuestros Servicios',
  servicesSubtitle: 'A medida de tus necesidades, con foco en calidad y fiabilidad.',
  airportTitle: 'Traslados al aeropuerto',
  airportDesc:
    'Conexiones sin problemas a todos los principales aeropuertos del Reino Unido. Hacemos seguimiento de tu vuelo.',
  corporateTitle: 'Viajes corporativos',
  corporateDesc:
    'Transporte fiable y profesional para tu empresa. Facturación mensual disponible.',
  eventsTitle: 'Eventos especiales',
  eventsDesc:
    'Llega con estilo a bodas, conciertos o cualquier ocasión especial. Nos ocupamos de los detalles.',
  videoTitle: 'Experimenta nuestro servicio de primera clase',
  videoSubtitle:
    'Mira nuestro corto para descubrir la diferencia SEBCO Travels. Desde nuestros vehículos impecables hasta nuestros chóferes profesionales, cada detalle está cuidado.',
  videoSubscribeCta: 'Suscríbete en YouTube',
  videoWatchMore: 'Ver más vídeos en nuestro canal',
  routesTitle: 'Rutas populares en el Reino Unido',
  routesSubtitle: 'Tarifas de muestra para nuestros trayectos al aeropuerto más reservados. Todo incluido.',
  routesFromPrice: 'desde',
  routesNote: 'Precios orientativos para una executive people carrier con hasta 8 pasajeros y equipaje. Tu presupuesto real se calculará con tus direcciones exactas.',
  testTitle: 'Lo que dicen nuestros pasajeros',
  testSubtitle: 'Opiniones reales de familias y viajeros de negocios reales.',
  test1Quote: 'Reservé la noche antes de nuestro vuelo de las 5am desde Heathrow. El conductor estaba fuera 10 minutos antes, la furgoneta impecable, ayudó con cada maleta y los niños durmieron todo el camino. Solo usaré SEBCO de ahora en adelante.',
  test1Name: 'Sarah M.',
  test1Trip: 'Reading → Heathrow T5 · Familia de 5',
  test2Quote: 'Los usamos para un traslado corporativo grupal a Gatwick. Precio fijo, sin sorpresas, limpio y profesional. El chófer iba de traje y puntual. Por encima de cualquier minicab.',
  test2Name: 'James K.',
  test2Trip: 'Centro de Londres → Gatwick · Corporativo',
  test3Quote: 'Vuelo retrasado 90 minutos. La mayoría habría cobrado suplemento; SEBCO simplemente siguió el vuelo y apareció cuando aterrizamos. Honestidad total. Reservando la vuelta ahora mismo.',
  test3Name: 'Anna W.',
  test3Trip: 'Stansted → Cambridge · Pareja',
  faqTitle: 'Preguntas frecuentes',
  faqSubtitle: 'Todo lo que necesitas saber sobre reservar con SEBCO Travels.',
  faq1Q: '¿Con cuánta antelación tengo que reservar?',
  faq1A: 'Las reservas anticipadas se abren con hasta 6 meses de antelación y cierran 1 hora antes de la recogida. Cuanto antes reserves, más fiablemente podemos garantizarte plaza, sobre todo en horas punta.',
  faq2Q: '¿Cuándo y cómo pago?',
  faq2A: 'Solo pagas DESPUÉS del viaje. Al reservar hacemos una autorización en tu tarjeta por el precio fijo acordado; la capturamos al llegar. Aceptamos las principales tarjetas de crédito y débito vía Stripe.',
  faq3Q: '¿Las sillas para niños son realmente gratis?',
  faq3A: 'Sí — las sillas de bebé, niño y elevador están incluidas sin coste extra. Solo dinos cuántas y de qué tipo al reservar; estarán instaladas y esperándote en la furgoneta.',
  faq4Q: '¿Qué pasa si mi vuelo se retrasa?',
  faq4A: 'Seguimos todos los vuelos entrantes en tiempo real. Si te retrasas horas, tu conductor seguirá allí cuando aterrices — sin rebooking ni suplementos.',
  faq5Q: '¿Cuál es vuestra política de cancelación?',
  faq5A: 'Cancela gratis hasta 4 horas antes de la recogida. Entre 4 horas y 1 hora antes, cobramos el 50%; con menos de 1 hora o no-show, el 100%. La preautorización se libera al instante si la cancelación es gratuita.',
  faq6Q: '¿Qué zonas del Reino Unido cubrís?',
  faq6A: 'Cubrimos todas las rutas del Reino Unido continental puerta a puerta, con foco en el sudeste, los aeropuertos londinenses y el valle del Támesis. Traslados de larga distancia también — pide presupuesto en segundos.',
  footerCol1Title: 'Servicios',
  footerCol2Title: 'Rutas populares',
  footerCol3Title: 'Empresa',
  footerCredentials: 'Operador de alquiler privado autorizado · Seguro Hire & reward · Chóferes con DBS',
  privacyPolicy: 'Política de Privacidad',
  termsOfService: 'Términos de Servicio',
  contactTitle: 'Contacto',
  contactSubtitle: '¿Listo para reservar o tienes una pregunta? Escríbenos directamente.',
  copyright: '© 2024 SEBCO Travels Ltd. Todos los derechos reservados.',
  siteSeoTitle: 'SEBCO Travels | Furgonetas Premium Familiares y al Aeropuerto en el Reino Unido',
  siteSeoDescription:
    'Reserva una executive people carrier con chófer en todo el Reino Unido. Precios fijos, sillas para niños, seguimiento de vuelo, conductores verificados. Reserva en segundos, paga solo al terminar.',
  loadingText: 'Un momento…',
  booking: bookingFallback,
  routePage: routePageEs,
};

// ---------------------------------------------------------------------------
// French
// ---------------------------------------------------------------------------

const fr: AppTranslations = {
  ...en,
  tagline: 'Transport Terrestre Première Classe',
  navBook: 'Réserver',
  navFleet: 'Flotte',
  navServices: 'Services',
  navVideo: 'Vidéo',
  navContact: 'Contact',
  navCall: 'Appeler',
  heroEyebrow: 'Réservations anticipées de van dans tout le Royaume-Uni',
  heroTitle: 'Votre taxi familial,',
  heroTitleAccent: 'première classe sur la route.',
  heroSubtitle:
    'Une people carrier executive avec chauffeur. Prix fixe à l’avance, sièges auto enfants inclus, suivi de vol sur chaque trajet aéroport. Réservez en quelques secondes, sans application à télécharger.',
  heroPoint1: 'Prix fixe à l’avance',
  heroPoint2: 'Sièges auto enfants gratuits',
  heroPoint3: 'Prise en charge aéroport avec suivi de vol',
  heroPoint4: 'Chauffeurs vérifiés DBS et pleinement assurés',
  stickyBook: 'Réserver',
  stickyCall: 'Appeler',
  trustDbsTitle: 'Vérification DBS',
  trustDbsDesc: 'Chauffeurs vérifiés uniquement',
  trustInsuredTitle: 'Pleinement assuré',
  trustInsuredDesc: 'Hire & reward + responsabilité civile',
  trustFamilyTitle: 'Entreprise familiale',
  trustFamilyDesc: 'Pas d’intermédiaire, pas de call center',
  trustPriceTitle: 'Prix fixe',
  trustPriceDesc: 'Devisé à l’avance, sans majoration',
  trustAvailableTitle: 'Disponible 24 / 7',
  trustAvailableDesc: 'Réservez à toute heure, tous les jours',
  howTitle: 'Réservez en 60 secondes',
  howSubtitle: 'Pas d’application. Pas de compte. Vous ne payez qu’une fois le trajet terminé.',
  howStep1Title: 'Obtenez votre prix fixe',
  howStep1Desc: 'Indiquez la prise en charge et la destination. Nous calculons la tarif exact instantanément grâce à la cartographie en direct.',
  howStep2Title: 'Confirmez les détails',
  howStep2Desc: 'Donnez-nous le numéro de vol, les passagers, les bagages et les sièges enfants. Vous recevez une confirmation par e-mail en quelques secondes.',
  howStep3Title: 'Voyagez en confort',
  howStep3Desc: 'Votre chauffeur arrive 5 minutes en avance. Suivez le trajet en direct sur votre téléphone. Vous ne payez qu’à l’arrivée en toute sécurité.',
  whyTitle: 'Pourquoi les familles choisissent SEBCO',
  whySubtitle: 'Conçu pour la façon dont les familles et les groupes voyagent vraiment, pas comme une app générique.',
  why1Title: 'Jusqu’à 8 dans un seul van',
  why1Desc: 'Plus besoin de séparer le groupe en deux voitures. Tout le monde ensemble, avec les bagages, dans un véhicule premium.',
  why2Title: 'Vraie place pour les bagages',
  why2Desc: 'Poussette, clubs de golf, skis, grandes valises — le executive carrier avale tout. Pas de bagages sur les genoux.',
  why3Title: 'Sièges enfants inclus',
  why3Desc: 'Nourrisson, bambin et réhausseur — installés, gratuits, qui vous attendent à l’arrivée. Dites-nous juste ce qu’il faut en réservant.',
  why4Title: 'Prix fixe à l’avance',
  why4Desc: 'Devisé avant la réservation. Pas de majoration les jours fériés. Pas de compteur dans les bouchons. Ce que vous voyez est ce que vous payez.',
  why5Title: 'Suivi de vol',
  why5Desc: 'Avion retardé de deux heures ? Nous le savons. Votre chauffeur se présente quand vous atterrissez vraiment, sans frais supplémentaires.',
  why6Title: 'Un seul chauffeur, pas un inconnu',
  why6Desc: 'Le même chauffeur vérifié DBS, habillé professionnellement, de porte à porte. Pas d’annulation de dernière minute.',
  fleetTitle: 'Notre Flotte Premium',
  fleetSubtitle:
    'Véhicules spacieux, impeccables et luxueux. Soigneusement entretenus pour votre sécurité et votre confort.',
  citroenTitle: 'Citroën SpaceTourer noir — 8 places',
  citroenDesc:
    'Notre vaisseau amiral est un Citroën SpaceTourer noir executive — huit sièges en cuir réglables individuellement, toit panoramique, climatisation rang par rang, recharge USB-C à chaque rangée et un coffre capable d’absorber huit grandes valises ou tout un kit de poussettes, skis et clubs de golf. Montez dans votre sanctuaire privé sur la route, guidé par un chauffeur professionnel vérifié DBS.',
  servicesTitle: 'Nos Services',
  servicesSubtitle: 'Sur mesure selon vos besoins, avec un focus sur la qualité et la fiabilité.',
  airportTitle: 'Transferts aéroport',
  airportDesc:
    'Connexions sans accroc vers tous les principaux aéroports du Royaume-Uni. Nous suivons votre vol.',
  corporateTitle: 'Voyages d’affaires',
  corporateDesc:
    'Transport fiable et professionnel pour votre entreprise. Facturation mensuelle disponible.',
  eventsTitle: 'Événements spéciaux',
  eventsDesc:
    'Arrivez avec style aux mariages, concerts ou toute occasion spéciale. Nous nous occupons des détails.',
  videoTitle: 'Découvrez notre service première classe',
  videoSubtitle:
    'Regardez notre court-métrage pour voir la différence SEBCO Travels. De nos véhicules impeccables à nos chauffeurs professionnels, chaque détail est soigné.',
  videoSubscribeCta: 'S’abonner sur YouTube',
  videoWatchMore: 'Voir plus de vidéos sur notre chaîne',
  routesTitle: 'Trajets populaires au Royaume-Uni',
  routesSubtitle: 'Exemples de tarifs pour nos trajets aéroport les plus réservés. Tout inclus.',
  routesFromPrice: 'à partir de',
  routesNote: 'Tarifs indicatifs pour une people carrier executive jusqu’à 8 passagers avec bagages. Votre devis réel sera calculé à partir de vos adresses exactes.',
  testTitle: 'Ce que disent nos passagers',
  testSubtitle: 'Avis réels de familles et de voyageurs d’affaires réels.',
  test1Quote: 'Réservé la veille de notre vol de 5h depuis Heathrow. Le chauffeur était dehors 10 minutes en avance, le van impeccable, il a aidé avec chaque valise, et les enfants ont dormi tout le trajet. Je n’utiliserai plus que SEBCO désormais.',
  test1Name: 'Sarah M.',
  test1Trip: 'Reading → Heathrow T5 · Famille de 5',
  test2Quote: 'Utilisés pour un transfert de groupe d’entreprise vers Gatwick. Prix fixe, pas de surprises, propre et professionnel. Le chauffeur était en costume et à l’heure. Une classe au-dessus du minicab habituel.',
  test2Name: 'James K.',
  test2Trip: 'Centre de Londres → Gatwick · Entreprise',
  test3Quote: 'Vol retardé de 90 minutes. La plupart des sociétés auraient facturé un supplément ; SEBCO a juste suivi le vol et s’est présenté quand nous avons atterri. Honnêteté totale. Je réserve le retour maintenant.',
  test3Name: 'Anna W.',
  test3Trip: 'Stansted → Cambridge · Couple',
  faqTitle: 'Questions fréquentes',
  faqSubtitle: 'Tout ce que vous devez savoir pour réserver avec SEBCO Travels.',
  faq1Q: 'Combien de temps à l’avance dois-je réserver ?',
  faq1A: 'Les réservations anticipées sont ouvertes jusqu’à 6 mois à l’avance et se ferment 1 heure avant la prise en charge. Plus vous réservez tôt, plus nous pouvons vous garantir la place — les heures de pointe aéroport partent vite.',
  faq2Q: 'Quand et comment je paie ?',
  faq2A: 'Vous ne payez qu’APRÈS le trajet. À la réservation nous faisons une préautorisation sur votre carte du prix fixe convenu ; nous la capturons à votre arrivée. Nous acceptons les principales cartes de crédit et de débit via Stripe.',
  faq3Q: 'Les sièges enfants sont-ils vraiment gratuits ?',
  faq3A: 'Oui — sièges nourrisson, bambin et réhausseur inclus sans coût supplémentaire. Dites-nous combien et de quel type en réservant ; ils sont installés et vous attendent dans le van.',
  faq4Q: 'Que se passe-t-il si mon vol est retardé ?',
  faq4A: 'Nous suivons tous les vols entrants en temps réel. Si vous êtes retardé de plusieurs heures, votre chauffeur sera toujours là quand vous atterrissez — sans re-réservation, sans frais supplémentaires, sans majoration.',
  faq5Q: 'Quelle est votre politique d’annulation ?',
  faq5A: 'Annulation gratuite jusqu’à 4 heures avant la prise en charge. Entre 4 heures et 1 heure avant, nous facturons 50 % du tarif ; moins d’1 heure ou no-show, 100 %. La préautorisation est libérée immédiatement en cas d’annulation gratuite.',
  faq6Q: 'Quelles zones du Royaume-Uni couvrez-vous ?',
  faq6A: 'Nous couvrons toutes les routes du Royaume-Uni continental de porte à porte, avec un focus sur le Sud-Est, les aéroports de Londres et la vallée de la Tamise. Les longs trajets inter-régions sont les bienvenus — demandez un devis en quelques secondes.',
  footerCol1Title: 'Services',
  footerCol2Title: 'Trajets populaires',
  footerCol3Title: 'Entreprise',
  footerCredentials: 'Opérateur de location privée agréé · Assurance Hire & reward · Chauffeurs vérifiés DBS',
  privacyPolicy: 'Politique de confidentialité',
  termsOfService: 'Conditions d’utilisation',
  contactTitle: 'Nous contacter',
  contactSubtitle: 'Prêt à réserver ou avez une question ? Contactez-nous directement.',
  copyright: '© 2024 SEBCO Travels Ltd. Tous droits réservés.',
  siteSeoTitle: 'SEBCO Travels | Van Familial Premium et Transferts Aéroport au Royaume-Uni',
  siteSeoDescription:
    'Réservez une people carrier executive avec chauffeur dans tout le Royaume-Uni. Prix fixe, sièges enfants, suivi de vol, chauffeurs vérifiés. Réservez en quelques secondes, ne payez qu’à la fin.',
  loadingText: 'Un instant…',
  booking: bookingFallback,
  routePage: routePageFr,
};

// ---------------------------------------------------------------------------
// German
// ---------------------------------------------------------------------------

const de: AppTranslations = {
  ...en,
  tagline: 'Erstklassige Bodentransporte',
  navBook: 'Buchen',
  navFleet: 'Flotte',
  navServices: 'Leistungen',
  navVideo: 'Video',
  navContact: 'Kontakt',
  navCall: 'Anrufen',
  heroEyebrow: 'Vorgebuchte Van-Transfers in ganz Großbritannien',
  heroTitle: 'Ihr Familientaxi,',
  heroTitleAccent: 'erste Klasse auf der Straße.',
  heroSubtitle:
    'Ein Executive-People-Carrier mit Chauffeur. Festpreis, Kindersitze inklusive, Flug-Tracking bei jeder Flughafenfahrt. In Sekunden buchen — keine App nötig.',
  heroPoint1: 'Festpreis ohne Aufschlag',
  heroPoint2: 'Kindersitze kostenlos',
  heroPoint3: 'Flughafen-Abholung mit Flug-Tracking',
  heroPoint4: 'DBS-geprüfte, voll versicherte Fahrer',
  stickyBook: 'Jetzt buchen',
  stickyCall: 'Anrufen',
  trustDbsTitle: 'DBS-geprüft',
  trustDbsDesc: 'Nur überprüfte Chauffeure',
  trustInsuredTitle: 'Voll versichert',
  trustInsuredDesc: 'Hire & reward + Haftpflicht',
  trustFamilyTitle: 'Familienbetrieb',
  trustFamilyDesc: 'Kein Vermittler, kein Callcenter',
  trustPriceTitle: 'Festpreis',
  trustPriceDesc: 'Im Voraus kalkuliert, kein Aufschlag',
  trustAvailableTitle: '24 / 7 verfügbar',
  trustAvailableDesc: 'Jederzeit buchbar',
  howTitle: 'In 60 Sekunden buchen',
  howSubtitle: 'Keine App. Kein Konto. Sie bezahlen erst nach Abschluss der Fahrt.',
  howStep1Title: 'Erhalten Sie Ihren Festpreis',
  howStep1Desc: 'Geben Sie Abhol- und Zielort ein. Wir berechnen den genauen Preis sofort mit aktuellen Kartendaten.',
  howStep2Title: 'Bestätigen Sie die Details',
  howStep2Desc: 'Teilen Sie uns Flugnummer, Passagiere, Gepäck und Kindersitze mit. Sie erhalten in Sekunden eine E-Mail-Bestätigung.',
  howStep3Title: 'Reisen Sie komfortabel',
  howStep3Desc: 'Ihr Chauffeur kommt 5 Minuten früher. Verfolgen Sie die Fahrt live auf Ihrem Handy. Bezahlen Sie erst nach sicherer Ankunft.',
  whyTitle: 'Warum Familien SEBCO wählen',
  whySubtitle: 'Gebaut für die Art, wie Familien und Gruppen tatsächlich reisen — nicht wie eine generische App.',
  why1Title: 'Bis zu 8 in einem Van',
  why1Desc: 'Keine Aufteilung der Gruppe in zwei Autos. Alle zusammen, mit dem Gepäck, in einem Premium-People-Carrier.',
  why2Title: 'Echter Gepäckraum',
  why2Desc: 'Kinderwagen, Golfschläger, Skier, große Koffer — der Executive-Carrier schluckt alles. Kein Gepäck auf dem Schoß.',
  why3Title: 'Kindersitze inklusive',
  why3Desc: 'Baby-, Kleinkind- und Sitzerhöhung — montiert, kostenlos, bei der Ankunft bereit. Geben Sie einfach bei der Buchung an, welche Sie brauchen.',
  why4Title: 'Festpreis im Voraus',
  why4Desc: 'Im Voraus kalkuliert. Keine Feiertagsaufschläge. Kein Taxameter im Stau. Was Sie sehen, ist was Sie zahlen.',
  why5Title: 'Flug-Tracking',
  why5Desc: 'Flug zwei Stunden verspätet? Wir wissen es. Ihr Fahrer kommt, wenn Sie tatsächlich landen — ohne Aufpreis.',
  why6Title: 'Ein Chauffeur, kein Fremder',
  why6Desc: 'Derselbe DBS-geprüfte, professionell gekleidete Fahrer von Tür zu Tür. Keine Last-Minute-Absagen.',
  fleetTitle: 'Unsere Premium-Flotte',
  fleetSubtitle:
    'Geräumige, makellose und luxuriöse Fahrzeuge. Sorgfältig gewartet für Ihre Sicherheit und Ihren Komfort.',
  citroenTitle: 'Schwarzer Citroën SpaceTourer — 8 Sitze',
  citroenDesc:
    'Unser Flaggschiff ist ein schwarzer Citroën SpaceTourer Executive — acht einzeln verstellbare Ledersitze, Panoramaglasdach, Klimaregelung Reihe für Reihe, USB-C-Laden in jeder Reihe und ein Kofferraum, der acht große Koffer oder einen kompletten Satz Kinderwagen, Skier und Golfschläger schluckt. Betreten Sie Ihr privates Heiligtum auf der Straße, geführt von einem DBS-geprüften professionellen Chauffeur.',
  servicesTitle: 'Unsere Leistungen',
  servicesSubtitle: 'Maßgeschneidert nach Ihren Bedürfnissen, mit Fokus auf Qualität und Zuverlässigkeit.',
  airportTitle: 'Flughafentransfers',
  airportDesc:
    'Reibungslose Verbindungen zu allen großen Flughäfen Großbritanniens. Wir verfolgen Ihren Flug.',
  corporateTitle: 'Geschäftsreisen',
  corporateDesc:
    'Zuverlässiger und professioneller Transport für Ihr Unternehmen. Monatliche Abrechnung möglich.',
  eventsTitle: 'Besondere Anlässe',
  eventsDesc:
    'Kommen Sie stilvoll zu Hochzeiten, Konzerten oder jedem besonderen Anlass. Wir kümmern uns um die Details.',
  videoTitle: 'Erleben Sie unseren erstklassigen Service',
  videoSubtitle:
    'Sehen Sie unseren Kurzfilm, um den SEBCO Travels-Unterschied zu erleben. Von unseren makellosen Fahrzeugen bis zu unseren professionellen Chauffeuren ist jedes Detail durchdacht.',
  videoSubscribeCta: 'Auf YouTube abonnieren',
  videoWatchMore: 'Weitere Videos auf unserem Kanal',
  routesTitle: 'Beliebte Strecken in Großbritannien',
  routesSubtitle: 'Beispieltpreise für unsere meistgebuchten Flughafenfahrten. Alles inklusive.',
  routesFromPrice: 'ab',
  routesNote: 'Richtpreise für einen Executive-People-Carrier mit bis zu 8 Passagieren und Gepäck. Ihr tatsächlicher Festpreis wird auf Basis Ihrer genauen Adressen berechnet.',
  testTitle: 'Was unsere Fahrgäste sagen',
  testSubtitle: 'Echte Bewertungen von echten Familien und Geschäftsreisenden.',
  test1Quote: 'Am Abend vor unserem 5-Uhr-Flug von Heathrow gebucht. Der Fahrer war 10 Minuten zu früh da, makelloser Van, hat mit jedem Koffer geholfen, und die Kinder haben die ganze Fahrt geschlafen. Ich werde ab sofort nur noch SEBCO nutzen.',
  test1Name: 'Sarah M.',
  test1Trip: 'Reading → Heathrow T5 · Familie mit 5',
  test2Quote: 'Für einen Firmengruppentransfer nach Gatwick genutzt. Festpreis, keine Überraschungen, sauber und professionell. Der Chauffeur war im Anzug und pünktlich. Eine Klasse über dem üblichen Minicab.',
  test2Name: 'James K.',
  test2Trip: 'Londoner Zentrum → Gatwick · Geschäftlich',
  test3Quote: 'Flug 90 Minuten verspätet. Die meisten Firmen hären einen Aufpreis berechnet; SEBCO hat einfach den Flug verfolgt und stand bei der Landung bereit. Volle Ehrlichkeit. Buche gerade die Rückfahrt.',
  test3Name: 'Anna W.',
  test3Trip: 'Stansted → Cambridge · Paar',
  faqTitle: 'Häufig gestellte Fragen',
  faqSubtitle: 'Alles, was Sie über die Vorab-Buchung bei SEBCO Travels wissen müssen.',
  faq1Q: 'Wie weit im Voraus muss ich buchen?',
  faq1A: 'Vorab-Buchungen sind bis zu 6 Monate im Voraus möglich und schließen 1 Stunde vor der Abholung. Je früher Sie buchen, desto zuverlässiger können wir Ihnen den Slot garantieren — Stoßzeiten am Flughafen füllen sich schnell.',
  faq2Q: 'Wann und wie bezahle ich?',
  faq2A: 'Sie bezahlen erst NACH der Fahrt. Bei der Buchung autorisieren wir den Festpreis auf Ihrer Karte; wir belasten sie erst nach Ihrer Ankunft. Wir akzeptieren alle gängigen Kredit- und Debitkarten über Stripe.',
  faq3Q: 'Sind Kindersitze wirklich kostenlos?',
  faq3A: 'Ja — Baby-, Kleinkind- und Sitzerhöhungen sind ohne Aufpreis inklusive. Geben Sie bei der Buchung einfach Anzahl und Typ an; sie sind montiert und warten im Van auf Sie.',
  faq4Q: 'Was passiert, wenn mein Flug verspätet ist?',
  faq4A: 'Wir verfolgen jeden eingehenden Flug in Echtzeit. Wenn Sie stundenlang verspätet sind, ist Ihr Fahrer trotzdem da, wenn Sie landen — keine Umbuchung, keine Zusatzgebühren, kein Aufschlag.',
  faq5Q: 'Wie ist Ihre Stornierungsrichtlinie?',
  faq5A: 'Kostenlose Stornierung bis 4 Stunden vor der Abholung. Zwischen 4 Stunden und 1 Stunde vor der Abholung berechnen wir 50 %; unter 1 Stunde oder Nichterscheinen 100 %. Die Kartenautorisierung wird bei kostenloser Stornierung sofort freigegeben.',
  faq6Q: 'Welche Gebiete in Großbritannien decken Sie ab?',
  faq6A: 'Wir decken alle Routen auf dem britischen Festland von Tür zu Tür ab, mit Schwerpunkt auf Südostengland, Londoner Flughäfen und dem Themsetal. Langstrecken und landesweite Fahrten sind willkommen — Angebot in Sekundenschnelle.',
  footerCol1Title: 'Leistungen',
  footerCol2Title: 'Beliebte Strecken',
  footerCol3Title: 'Unternehmen',
  footerCredentials: 'Lizenzierter Mietwagenbetreiber · Hire & reward versichert · DBS-geprüfte Chauffeure',
  privacyPolicy: 'Datenschutzerklärung',
  termsOfService: 'Nutzungsbedingungen',
  contactTitle: 'Kontakt',
  contactSubtitle: 'Bereit zu buchen oder eine Frage? Kontaktieren Sie uns direkt.',
  copyright: '© 2024 SEBCO Travels Ltd. Alle Rechte vorbehalten.',
  siteSeoTitle: 'SEBCO Travels | Premium-Familien- und Flughafen-Van-Transfers in Großbritannien',
  siteSeoDescription:
    'Buchen Sie einen Executive-People-Carrier mit Chauffeur in ganz Großbritannien. Festpreis, Kindersitze inklusive, DBS-geprüfte Fahrer, Flug-Tracking. In Sekunden buchen, erst nach der Fahrt bezahlen.',
  loadingText: 'Einen Moment…',
  booking: bookingFallback,
  routePage: routePageDe,
};

// ---------------------------------------------------------------------------
// Italian
// ---------------------------------------------------------------------------

const it: AppTranslations = {
  ...en,
  tagline: 'Trasporto Terrestre di Prima Classe',
  navBook: 'Prenota',
  navFleet: 'Flotta',
  navServices: 'Servizi',
  navVideo: 'Video',
  navContact: 'Contatti',
  navCall: 'Chiama',
  heroEyebrow: 'Transfer in furgone prenotati in tutta la Gran Bretagna',
  heroTitle: 'Il tuo taxi familiare,',
  heroTitleAccent: 'prima classe su strada.',
  heroSubtitle:
    'Un people carrier executivo con autista. Prezzo fisso in anticipo, seggiolini per bambini inclusi, tracciamento del volo su ogni trasferimento aeroportuale. Prenota in pochi secondi, senza app da scaricare.',
  heroPoint1: 'Prezzo fisso in anticipo',
  heroPoint2: 'Seggiolini per bambini gratuiti',
  heroPoint3: 'Ritiro aeroportuale con tracciamento del volo',
  heroPoint4: 'Autisti con DBS e assicurazione completa',
  stickyBook: 'Prenota',
  stickyCall: 'Chiama',
  trustDbsTitle: 'Verifica DBS',
  trustDbsDesc: 'Solo autisti verificati',
  trustInsuredTitle: 'Completamente assicurati',
  trustInsuredDesc: 'Hire & reward + RC',
  trustFamilyTitle: 'Azienda familiare',
  trustFamilyDesc: 'Senza intermediari, senza call center',
  trustPriceTitle: 'Prezzo fisso',
  trustPriceDesc: 'Preventivato in anticipo, senza maggiorazioni',
  trustAvailableTitle: 'Disponibile 24 / 7',
  trustAvailableDesc: 'Prenota a qualsiasi ora, ogni giorno',
  howTitle: 'Prenota in 60 secondi',
  howSubtitle: 'Senza app. Senza account. Paghi solo a viaggio concluso.',
  howStep1Title: 'Ottieni il tuo prezzo fisso',
  howStep1Desc: 'Indica ritiro e destinazione. Calcoliamo la tariffa esatta all’istante con dati cartografici in tempo reale.',
  howStep2Title: 'Conferma i dettagli',
  howStep2Desc: 'Comunica numero di volo, passeggeri, bagagli e seggiolini. Ricevi la conferma via email in pochi secondi.',
  howStep3Title: 'Viaggia in comfort',
  howStep3Desc: 'Il tuo autista arriva 5 minuti prima. Segui il viaggio in diretta dal telefono. Paghi solo all’arrivo sicuro.',
  whyTitle: 'Perché le famiglie scelgono SEBCO',
  whySubtitle: 'Pensato per il modo in cui famiglie e gruppi viaggiano davvero, non come fa un’app generica.',
  why1Title: 'Fino a 8 in un solo furgone',
  why1Desc: 'Niente più gruppi divisi in due auto. Tutti insieme, con i bagagli, in un veicolo premium.',
  why2Title: 'Vero spazio per i bagagli',
  why2Desc: 'Passeggino, mazze da golf, sci, valigie grandi — l’executive carrier ingoia tutto. Niente bagagli in grembo.',
  why3Title: 'Seggiolini inclusi',
  why3Desc: 'Neonati, bimbi e rialzi — installati, gratuiti, pronti all’arrivo. Basta indicarli in fase di prenotazione.',
  why4Title: 'Prezzo fisso in anticipo',
  why4Desc: 'Preventivato prima della prenotazione. Nessuna maggiorazione nei festivi. Nessun tassametro nel traffico. Ciò che vedi è ciò che paghi.',
  why5Title: 'Tracciamento del volo',
  why5Desc: 'Volo in ritardo di due ore? Lo sappiamo. Il tuo autista arriva quando atterri davvero, senza costi extra.',
  why6Title: 'Un solo autista, non un estraneo',
  why6Desc: 'Lo stesso autista verificato DBS, vestito in modo professionale, porta a porta. Niente cancellazioni dell’ultimo minuto.',
  fleetTitle: 'La Nostra Flotta Premium',
  fleetSubtitle:
    'Veicoli spaziosi, impeccabili e lussuosi. Manutenuti con cura per la vostra sicurezza e comfort.',
  citroenTitle: 'Citroën SpaceTourer nero — 8 posti',
  citroenDesc:
    'La nostra ammiraglia è un Citroën SpaceTourer nero executivo — otto sedili in pelle regolabili individualmente, tetto panoramico in vetro, climatizzazione fila per fila, ricarica USB-C in ogni fila e un bagagliaio in grado di contenere otto valigie grandi o un set completo di passeggini, sci e mazze da golf. Entrate nel vostro santuario privato su strada, guidati da un autista professionale con verifica DBS.',
  servicesTitle: 'I Nostri Servizi',
  servicesSubtitle: 'Su misura per le vostre esigenze, con focus su qualità e affidabilità.',
  airportTitle: 'Transfer Aeroportuali',
  airportDesc:
    'Collegamenti senza intoppi verso tutti i principali aeroporti del Regno Unito. Monitoriamo il tuo volo.',
  corporateTitle: 'Viaggi Aziendali',
  corporateDesc:
    'Trasporto affidabile e professionale per la vostra azienda. Fatturazione mensile disponibile.',
  eventsTitle: 'Eventi Speciali',
  eventsDesc:
    'Arrivate in stile a matrimoni, concerti o qualsiasi occasione speciale. Ci occupiamo noi dei dettagli.',
  videoTitle: 'Vivi il nostro servizio di prima classe',
  videoSubtitle:
    'Guarda il nostro cortometraggio per scoprire la differenza SEBCO Travels. Dai nostri veicoli impeccabili ai nostri autisti professionali, ogni dettaglio è curato.',
  videoSubscribeCta: 'Iscriviti su YouTube',
  videoWatchMore: 'Guarda altri video sul nostro canale',
  routesTitle: 'Tratte popolari nel Regno Unito',
  routesSubtitle: 'Esempi di tariffe per i nostri transfer aeroportuali più richiesti. Tutto incluso.',
  routesFromPrice: 'da',
  routesNote: 'Prezzi indicativi per un executivo people carrier con fino a 8 passeggeri e bagagli. Il tuo preventivo reale verrà calcolato dai tuoi indirizzi esatti.',
  testTitle: 'Cosa dicono i nostri passeggeri',
  testSubtitle: 'Recensioni reali di famiglie e viaggiatori d’affari reali.',
  test1Quote: 'Prenotato la sera prima del nostro volo delle 5 da Heathrow. L’autista era fuori 10 minuti prima, furgone impeccabile, ha aiutato con ogni valigia, e i bambini hanno dormito tutto il viaggio. Userò solo SEBCO d’ora in poi.',
  test1Name: 'Sarah M.',
  test1Trip: 'Reading → Heathrow T5 · Famiglia di 5',
  test2Quote: 'Usati per un transfer aziendale di gruppo a Gatwick. Prezzo fisso, niente sorprese, pulito e professionale. L’autista era in giacca e cravatta e puntuale. Una classe sopra il solito minicab.',
  test2Name: 'James K.',
  test2Trip: 'Centro di Londra → Gatwick · Aziendale',
  test3Quote: 'Volo ritardato di 90 minuti. La maggior parte delle società avrebbe addebitato un supplemento; SEBCO ha semplicemente tracciato il volo e si è presentato quando siamo atterrati. Onestà totale. Sto prenotando il ritorno adesso.',
  test3Name: 'Anna W.',
  test3Trip: 'Stansted → Cambridge · Coppia',
  faqTitle: 'Domande frequenti',
  faqSubtitle: 'Tutto ciò che devi sapere sulla prenotazione anticipata con SEBCO Travels.',
  faq1Q: 'Con quanto anticipo devo prenotare?',
  faq1A: 'Le prenotazioni anticipate aprono fino a 6 mesi prima e chiudono 1 ora prima del ritiro. Prima prenoti, più affidabilmente possiamo garantirti il posto — le ore di punta in aeroporto si riempiono velocemente.',
  faq2Q: 'Quando e come pago?',
  faq2A: 'Paghi solo DOPO il viaggio. Alla prenotazione autorizziamo il prezzo fisso sulla tua carta; lo addebitiamo solo al tuo arrivo. Accettiamo le principali carte di credito e debito tramite Stripe.',
  faq3Q: 'I seggiolini per bambini sono davvero gratuiti?',
  faq3A: 'Sì — seggiolini neonati, bimbi e rialzi sono inclusi senza costi extra. Indica quanti e di che tipo in fase di prenotazione; saranno installati e ti aspettano nel furgone.',
  faq4Q: 'Cosa succede se il mio volo è in ritardo?',
  faq4A: 'Tracciamo ogni volo in arrivo in tempo reale. Se sei in ritardo di ore, il tuo autista sarà comunque lì quando atterri — senza riprenotazioni, senza costi extra, senza maggiorazioni.',
  faq5Q: 'Qual è la vostra politica di cancellazione?',
  faq5A: 'Cancellazione gratuita fino a 4 ore prima del ritiro. Tra 4 ore e 1 ora prima addebitiamo il 50%; meno di 1 ora o no-show, 100%. La pre-autorizzazione viene rilasciata immediatamente in caso di cancellazione gratuita.',
  faq6Q: 'Quali aree del Regno Unito coprite?',
  faq6A: 'Copriamo tutte le tratte della Gran Bretagna continentale porta a porta, con focus sul Sud-Est, sugli aeroporti londinesi e sulla valle del Tamigi. I viaggi a lungo raggio e interregionali sono i benvenuti — richiedi un preventivo in pochi secondi.',
  footerCol1Title: 'Servizi',
  footerCol2Title: 'Tratte popolari',
  footerCol3Title: 'Azienda',
  footerCredentials: 'Operatore di noleggio privato autorizzato · Assicurazione Hire & reward · Autisti verificati DBS',
  privacyPolicy: 'Informativa sulla Privacy',
  termsOfService: 'Termini di Servizio',
  contactTitle: 'Contatti',
  contactSubtitle: 'Pronto a prenotare o hai una domanda? Scrivici direttamente.',
  copyright: '© 2024 SEBCO Travels Ltd. Tutti i diritti riservati.',
  siteSeoTitle: 'SEBCO Travels | Transfer Premium in Furgone Familiare e Aeroportuale nel Regno Unito',
  siteSeoDescription:
    'Prenota un executivo people carrier con autista in tutta la Gran Bretagna. Prezzo fisso, seggiolini inclusi, autisti verificati DBS, tracciamento del volo. Prenota in pochi secondi, paghi solo a fine viaggio.',
  loadingText: 'Un attimo…',
  booking: bookingFallback,
  routePage: routePageIt,
};

// ---------------------------------------------------------------------------
// The exported translations object. Use the helpers at top of file to
// pick the right language and persist user choice.
// ---------------------------------------------------------------------------

export const translations: Record<Language, AppTranslations> = { en, pl, es, fr, de, it };

/** Looks up a translation safely, falling back to EN. */
export function tx(language: Language): AppTranslations {
  return translations[language] ?? translations.en;
}
