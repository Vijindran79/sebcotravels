/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pre-booking widget. Forces every booking to be at least 1 hour in the
 * future (the operator is a solo van driver and cannot dispatch instantly).
 * Designed to sit inside the dark hero, or stand alone.
 */

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BookingTranslations {
  // Heading
  widgetTitle: string;
  widgetSubtitle: string;
  // Vehicle type
  vehicleTitle: string;
  vehicleCarLabel: string;
  vehicleCarDesc: string;
  vehicleVanLabel: string;
  vehicleVanDesc: string;
  // Inputs
  pickupLabel: string;
  pickupPlaceholder: string;
  pickupHint: string;
  dropoffLabel: string;
  dropoffPlaceholder: string;
  dropoffHint: string;
  scheduledAtLabel: string;
  scheduledHelp: string;
  passengersTitle: string;
  adultsLabel: string;
  childrenLabel: string;
  luggageStandardLabel: string;
  luggageHeavyLabel: string;
  childSeatsTitle: string;
  childSeatInfant: string;
  childSeatToddler: string;
  childSeatBooster: string;
  contactTitle: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notesLabel: string;
  notesPlaceholder: string;
  // Actions / status
  submit: string;
  submitting: string;
  // Trust microcopy
  trustFixedPrice: string;
  trustNoCardYet: string;
  trustChildSeats: string;
  trustFlightTracking: string;
  // Quote view
  quoteHeading: string;
  quoteRefLabel: string;
  fixedPriceBadge: string;
  distanceLabel: string;
  etaLabel: string;
  pickupTimeLabel: string;
  quoteUnavailableHeading: string;
  quoteUnavailableBody: string;
  callUs: string;
  bookAnother: string;
  // Errors
  errorGeneric: string;
  errorChildSeats: string;
  errorMinLeadTime: string;
  // Offline state
  offlineBanner: string;
  offlineSaved: string;
  offlineSent: string;
  offlineRetrySoon: string;
}

interface BookingFormProps {
  t: BookingTranslations;
  apiBaseUrl: string;
  mapboxAccessToken: string;
  /** Render in compact mode for embedding inside a hero / sidebar. */
  variant?: 'standalone' | 'hero';
  /** Phone number rendered on quote-confirmation screens. */
  contactPhone?: string;
  /** Pre-fill the pick-up address (used by route landing pages). */
  initialPickup?: PlaceValue;
  /** Pre-fill the drop-off address (used by route landing pages). */
  initialDropoff?: PlaceValue;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface PlaceValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface FareSnapshot {
  base: number;
  perMile: number;
  distanceMiles: number;
  distanceFare: number;
  addonsTotal: number;
  total: number;
  currency: string;
}

interface LeadResponse {
  leadId: string;
  quoteStatus: 'quoted' | 'quote_unavailable';
  fare: FareSnapshot | null;
  distanceMeters: number | null;
  durationSeconds: number | null;
}

type FormStatus = 'idle' | 'submitting' | 'quoted' | 'pending' | 'error';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MIN_LEAD_TIME_MS = 60 * 60 * 1000; // 1 hour, mirrors backend

const OFFLINE_QUEUE_KEY = 'sebco-offline-leads-v1';

interface QueuedLead {
  id: string;
  createdAt: string;
  payload: any;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  gbp: '£',
  eur: '€',
  usd: '$',
  pln: 'zł',
};

// Matches a full UK postcode with the space: "RG1 1AA", "SW1A 1AA", "M11AA"
const UK_POSTCODE_FULL = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
function isFullUkPostcode(s: string): boolean {
  return UK_POSTCODE_FULL.test(s.trim());
}

function extractPostcode(s: string): string | null {
  // Try to extract a postcode pattern from the string (e.g. from "32 da2 7wp" or "da2 7wp")
  const match = s.match(/([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})/i);
  return match ? match[1].trim() : null;
}

const initialPlace: PlaceValue = { address: '', lat: null, lng: null };

function formatFare(fare: FareSnapshot): string {
  const symbol = CURRENCY_SYMBOL[fare.currency?.toLowerCase()] || fare.currency?.toUpperCase() || '';
  return `${symbol}${fare.total.toFixed(2)}`;
}

/** Return ISO `YYYY-MM-DDTHH:mm` in the user's local timezone, suitable for
 *  the `min` attribute and the value of a <input type="datetime-local">. */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) +
    ':' + pad(d.getMinutes())
  );
}

/** now + 1h, rounded up to the next 15-min mark. */
function defaultScheduledAt(): string {
  const d = new Date(Date.now() + MIN_LEAD_TIME_MS + 5 * 60 * 1000);
  const minutes = d.getMinutes();
  const roundUp = (15 - (minutes % 15)) % 15;
  d.setMinutes(minutes + roundUp, 0, 0);
  return toLocalInputValue(d);
}

// ---------------------------------------------------------------------------
// Mapbox Search Box autocomplete (REST API, no SDK needed)
// Free tier: 50,000 sessions / month. A "session" starts when the user
// begins typing and ends when they pick a suggestion (we send a session
// token with each request so Mapbox bills sessions instead of requests).
// ---------------------------------------------------------------------------

interface MapboxSuggestion {
  name: string;
  mapbox_id: string;
  place_formatted?: string;
  full_address?: string;
}

function buildSuggestionAddress(s: MapboxSuggestion): string {
  if (s.full_address) return s.full_address;
  const name = s.name?.trim() || '';
  const formatted = s.place_formatted?.trim() || '';
  if (!name) return formatted || name;
  if (!formatted || formatted.includes(name)) return formatted || name;
  return `${name}, ${formatted}`;
}

function normalizeSearchQuery(q: string): string {
  return q.replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

const SEARCHBOX_SUGGEST = 'https://api.mapbox.com/search/searchbox/v1/suggest';
const SEARCHBOX_RETRIEVE = 'https://api.mapbox.com/search/searchbox/v1/retrieve';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---------------------------------------------------------------------------
// Place input — text field + custom dropdown of Mapbox suggestions.
// Falls back to a plain text input when mapboxAccessToken is empty.
// ---------------------------------------------------------------------------

interface PlaceInputProps {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
  value: PlaceValue;
  onChange: (v: PlaceValue) => void;
  mapboxAccessToken: string;
  sessionToken: string;
  icon?: React.ReactNode;
}

const PlaceInput: FC<PlaceInputProps> = ({ id, label, placeholder, hint, value, onChange, mapboxAccessToken, sessionToken, icon }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  function fetchSuggestions(q: string) {
    if (!mapboxAccessToken || q.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const normalized = normalizeSearchQuery(q);
        // UK postcodes (e.g. "RG1 1AA", "SW1A 1AA") get the cleanest results
        // when we ask for `address` first (full PAF door numbers), then
        // `postcode`, then `place`. Limit 10 so users see a real list.
        const params = new URLSearchParams({
          q: normalized,
          session_token: sessionToken,
          access_token: mapboxAccessToken,
          country: 'gb',
          language: 'en',
          types: 'address,postcode,place,locality,street,district,poi',
          limit: '10',
        });
        const res = await fetch(`${SEARCHBOX_SUGGEST}?${params.toString()}`);
        const data = await res.json();
        let list: MapboxSuggestion[] = Array.isArray(data?.suggestions) ? data.suggestions : [];
        // If the user typed a full UK postcode (with the space), do a second
        // call asking for every address under that postcode — this is the
        // "door number list" the user asked for.
        const detectedPostcode = extractPostcode(normalized);
        if (detectedPostcode && isFullUkPostcode(detectedPostcode)) {
          const expand = new URLSearchParams({
            q: detectedPostcode,
            session_token: sessionToken,
            access_token: mapboxAccessToken,
            country: 'gb',
            language: 'en',
            types: 'address,poi',
            limit: '10',
          });
          const res2 = await fetch(`${SEARCHBOX_SUGGEST}?${expand.toString()}`);
          const data2 = await res2.json();
          const addresses = Array.isArray(data2?.suggestions) ? data2.suggestions : [];
          // De-dupe by mapbox_id, addresses first
          const seen = new Set<string>();
          list = [...addresses, ...list].filter((s) => {
            const k = s.mapbox_id || s.name;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        }
        setSuggestions(list);
        setOpen(list.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 220);
  }

  async function selectSuggestion(s: MapboxSuggestion) {
    const fallbackText = buildSuggestionAddress(s);
    onChange({ address: fallbackText, lat: null, lng: null });
    setOpen(false);
    setSuggestions([]);
    if (!mapboxAccessToken || !s.mapbox_id) return;
    try {
      const params = new URLSearchParams({
        session_token: sessionToken,
        access_token: mapboxAccessToken,
      });
      const res = await fetch(`${SEARCHBOX_RETRIEVE}/${encodeURIComponent(s.mapbox_id)}?${params.toString()}`);
      const data = await res.json();
      const feature = data?.features?.[0];
      const coords = feature?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        onChange({
          address: feature?.properties?.full_address || fallbackText,
          lng: Number(coords[0]),
          lat: Number(coords[1]),
        });
      }
    } catch {
      /* silent — the address text is already set, backend accepts text-only leads */
    }
  }

  // Close dropdown when clicking outside.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]">{icon}</span>
        )}
        <input
          id={id}
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          placeholder={placeholder}
          value={value.address}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onChange={(e) => {
            const text = e.target.value;
            onChange({ address: text, lat: null, lng: null });
            fetchSuggestions(text);
          }}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && activeIndex >= 0) {
              e.preventDefault();
              selectSuggestion(suggestions[activeIndex]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className={`w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 ${icon ? 'pl-10' : 'pl-3'} pr-9 py-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent`}
        />
        {hint && !value.address && (
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>
        )}
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" aria-hidden="true">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M22 12a10 10 0 0 0-10-10"/>
            </svg>
          </span>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F2842] shadow-xl"
        >
          {suggestions.map((s, i) => {
            const addressText = buildSuggestionAddress(s);
            const secondaryText = s.place_formatted && s.place_formatted.trim() !== addressText.trim()
              ? s.place_formatted.trim()
              : undefined;
            return (
              <li
                key={s.mapbox_id || `${s.name}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`px-3 min-h-[44px] flex flex-col justify-center cursor-pointer text-sm border-b last:border-b-0 border-gray-100 dark:border-white/5 ${
                  i === activeIndex
                    ? 'bg-[#D4AF37]/15 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="font-semibold leading-tight">{addressText}</div>
                {secondaryText && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {secondaryText}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Number stepper (+ / - buttons)
// ---------------------------------------------------------------------------

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}

const NumberField: FC<NumberFieldProps> = ({ id, label, value, min = 0, max = 12, onChange }) => {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5">
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          className="px-3 min-h-[44px] min-w-[44px] text-lg text-gray-600 dark:text-gray-300 disabled:opacity-30"
        >
          &minus;
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
          className="w-full min-w-0 min-h-[44px] bg-transparent text-center text-base font-semibold text-gray-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          className="px-3 min-h-[44px] min-w-[44px] text-lg text-gray-600 dark:text-gray-300 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Trust microcopy strip
// ---------------------------------------------------------------------------

const TrustRow: FC<{ t: BookingTranslations }> = ({ t }) => (
  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
    {[t.trustFixedPrice, t.trustNoCardYet, t.trustChildSeats, t.trustFlightTracking].map((line) => (
      <li key={line} className="flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-[#D4AF37] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd"/>
        </svg>
        <span className="leading-tight">{line}</span>
      </li>
    ))}
  </ul>
);

// ---------------------------------------------------------------------------
// Inline icons
// ---------------------------------------------------------------------------

const PinIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const FlagIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

// Inline car + van icons used in the vehicle-type toggle. They take a
// boolean `active` so the unselected tile is muted, the selected tile
// is the brand gold.
const CarIcon: FC<{ active: boolean }> = ({ active }) => (
  <svg width="32" height="20" viewBox="0 0 64 40" fill="none" stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M6 26 L10 14 a4 4 0 0 1 4-3 H44 a4 4 0 0 1 4 3 L54 26 V32 a2 2 0 0 1-2 2 H8 a2 2 0 0 1-2-2 Z"/>
    <path d="M14 11 L18 4 H38 L42 11"/>
    <circle cx="16" cy="32" r="3" fill="currentColor" stroke="none" opacity="0.85"/>
    <circle cx="46" cy="32" r="3" fill="currentColor" stroke="none" opacity="0.85"/>
  </svg>
);
const VanIcon: FC<{ active: boolean }> = ({ active }) => (
  <svg width="32" height="20" viewBox="0 0 64 40" fill="none" stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M4 30 V14 a4 4 0 0 1 4-4 H36 V30 H4Z"/>
    <path d="M36 18 H52 a4 4 0 0 1 4 4 V30 H36"/>
    <path d="M36 10 V20"/>
    <path d="M36 18 H44"/>
    <circle cx="14" cy="32" r="3" fill="currentColor" stroke="none" opacity="0.85"/>
    <circle cx="50" cy="32" r="3" fill="currentColor" stroke="none" opacity="0.85"/>
  </svg>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const BookingForm: FC<BookingFormProps> = ({ t, apiBaseUrl, mapboxAccessToken, variant = 'standalone', contactPhone, initialPickup, initialDropoff }) => {
  const [vehicleType, setVehicleType] = useState<'car' | 'van'>('van');
  const [pickup, setPickup] = useState<PlaceValue>(initialPickup ?? initialPlace);
  const [dropoff, setDropoff] = useState<PlaceValue>(initialDropoff ?? initialPlace);
  const [scheduledAt, setScheduledAt] = useState<string>(() => defaultScheduledAt());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [luggageStandard, setLuggageStandard] = useState(0);
  const [luggageHeavy, setLuggageHeavy] = useState(0);
  const [infantSeats, setInfantSeats] = useState(0);
  const [toddlerSeats, setToddlerSeats] = useState(0);
  const [boosterSeats, setBoosterSeats] = useState(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [notes, setNotes] = useState('');

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [quote, setQuote] = useState<LeadResponse | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator === 'undefined' ? false : !navigator.onLine,
  );
  const [offlineQueueSize, setOfflineQueueSize] = useState<number>(0);

  // ---------- Offline lead queue -----------------------------------------
  const readQueue = (): QueuedLead[] => {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const writeQueue = (q: QueuedLead[]) => {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q)); } catch { /* quota? */ }
  };
  const enqueueOfflineLead = (payload: any) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const next: QueuedLead[] = [...readQueue(), { id, createdAt: new Date().toISOString(), payload }];
    writeQueue(next);
    setOfflineQueueSize(next.length);
  };
  const flushOfflineQueue = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const queue = readQueue();
    if (queue.length === 0) return;
    const remaining: QueuedLead[] = [];
    for (const item of queue) {
      try {
        const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        if (!res.ok) {
          remaining.push(item); // keep it for next attempt
        }
      } catch {
        remaining.push(item); // network still flaky
      }
    }
    writeQueue(remaining);
    setOfflineQueueSize(remaining.length);
  };

  // Listen for connectivity changes.
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Fire-and-forget: flush any queued leads now that we are connected.
      flushOfflineQueue().catch(() => { /* silently keep queue */ });
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOfflineQueueSize(readQueue().length);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  // Single Mapbox session token reused for both inputs while the user is
  // filling the form. Mapbox bills "sessions" not requests, so a new uuid
  // is generated only when the user resets or completes a booking.
  const [sessionToken, setSessionToken] = useState<string>(() => uuid());

  // Compute the rolling 1-hour-from-now floor for the datetime input. It
  // refreshes when the user opens the form so the visitor can't sneak in a
  // stale value.
  const minScheduledAt = useMemo(() => toLocalInputValue(new Date(Date.now() + MIN_LEAD_TIME_MS)), [status]);

  useEffect(() => {
    // Mapbox autocomplete is REST-only; nothing to load. Just rotate the
    // session token when the access token actually changes (e.g. after
    // hot-reload during development).
    setSessionToken(uuid());
  }, [mapboxAccessToken]);

  // When the route page changes (initialPickup/initialDropoff swap to a
  // different route), update the form to reflect the new pre-fills.
  useEffect(() => {
    if (initialPickup) setPickup(initialPickup);
    if (initialDropoff) setDropoff(initialDropoff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPickup?.address, initialDropoff?.address]);

  const totalSeats = infantSeats + toddlerSeats + boosterSeats;
  const seatsExceedChildren = totalSeats > children;

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  const scheduledTooSoon = !!scheduledDate && scheduledDate.getTime() - Date.now() < MIN_LEAD_TIME_MS - 60_000;

  const formInvalid = useMemo(() => {
    if (!pickup.address.trim() || !dropoff.address.trim()) return true;
    if (!contactName.trim() || !contactEmail.trim() || !contactPhoneInput.trim()) return true;
    if (!scheduledAt || scheduledTooSoon) return true;
    if (seatsExceedChildren) return true;
    return false;
  }, [pickup, dropoff, contactName, contactEmail, contactPhoneInput, scheduledAt, scheduledTooSoon, seatsExceedChildren]);

  function resetForm() {
    // Restore to the pre-fill values (if any) rather than blank so a route
    // landing page keeps its pickup/dropoff after "Book another".
    setPickup(initialPickup ?? initialPlace);
    setDropoff(initialDropoff ?? initialPlace);
    setScheduledAt(defaultScheduledAt());
    setAdults(1);
    setChildren(0);
    setLuggageStandard(0);
    setLuggageHeavy(0);
    setInfantSeats(0);
    setToddlerSeats(0);
    setBoosterSeats(0);
    setContactName('');
    setContactEmail('');
    setContactPhoneInput('');
    setNotes('');
    setStatus('idle');
    setErrorMessage('');
    setQuote(null);
    setAdvanced(false);
    setSessionToken(uuid()); // start a fresh Mapbox session for the next booking
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formInvalid || status === 'submitting') return;
    setStatus('submitting');
    setErrorMessage('');
    setQuote(null);

    const payload: any = {
      contact: {
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhoneInput.trim(),
      },
      vehicleType, // 'car' (Executive sedan) or 'van' (8-seater MPV)
      pickup: {
        address: pickup.address.trim(),
        ...(pickup.lat !== null && pickup.lng !== null ? { lat: pickup.lat, lng: pickup.lng } : {}),
      },
      dropoff: {
        address: dropoff.address.trim(),
        ...(dropoff.lat !== null && dropoff.lng !== null ? { lat: dropoff.lat, lng: dropoff.lng } : {}),
      },
      passengers: { adults, children },
      luggage: { standard: luggageStandard, heavy: luggageHeavy },
      childSeats: { infant: infantSeats, toddler: toddlerSeats, booster: boosterSeats },
      scheduledFor: new Date(scheduledAt).toISOString(),
    };
    if (notes.trim()) payload.notes = notes.trim();

    // If we know we're offline, skip the network attempt entirely and queue
    // the lead into localStorage. The online-listener in another useEffect
    // will flush it later.
    if (isOffline) {
      enqueueOfflineLead(payload);
      setStatus('pending'); // re-uses the "request received" panel
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data?.error || t.errorGeneric);
        setStatus('error');
        return;
      }
      setQuote(data as LeadResponse);
      setStatus(data.quoteStatus === 'quoted' ? 'quoted' : 'pending');
      // Scroll the quote into view (in case widget was in hero).
      setTimeout(() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err: any) {
      setErrorMessage(err?.message || t.errorGeneric);
      setStatus('error');
    }
  }

  const containerWrap = variant === 'hero'
    ? 'rounded-xl shadow-2xl bg-white dark:bg-[#0F2842] border border-black/5 dark:border-white/10 p-5 sm:p-6'
    : 'rounded-xl shadow-2xl bg-white dark:bg-[#0F2842] border border-black/5 dark:border-white/10 p-6 sm:p-8';

  // -------------------------------------------------------------------------
  // Quote / confirmation view (overrides form)
  // -------------------------------------------------------------------------
  if (status === 'quoted' || status === 'pending') {
    const refShort = quote?.leadId ? quote.leadId.slice(-6).toUpperCase() : '';
    const scheduledText = scheduledDate?.toLocaleString(undefined, {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
    return (
      <div className={containerWrap}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {status === 'quoted' && quote?.fare ? t.quoteHeading : t.quoteUnavailableHeading}
            </h3>
            {refShort && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t.quoteRefLabel} <span className="font-mono font-semibold text-[#D4AF37]">{refShort}</span>
              </p>
            )}
          </div>
          <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-[#D4AF37]/15 text-[#D4AF37]">
            {t.fixedPriceBadge}
          </span>
        </div>

        {status === 'quoted' && quote?.fare ? (
          <>
            <div className="mt-5">
              <span className="text-5xl sm:text-6xl font-black text-[#D4AF37] tracking-tight">{formatFare(quote.fare)}</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-gray-50 dark:bg-white/5 p-3">
                <dt className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.distanceLabel}</dt>
                <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{quote.fare.distanceMiles.toFixed(1)} mi</dd>
              </div>
              {quote.durationSeconds !== null && (
                <div className="rounded-md bg-gray-50 dark:bg-white/5 p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.etaLabel}</dt>
                  <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{Math.round(quote.durationSeconds / 60)} min</dd>
                </div>
              )}
              {scheduledText && (
                <div className="col-span-2 rounded-md bg-gray-50 dark:bg-white/5 p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.pickupTimeLabel}</dt>
                  <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{scheduledText}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          isOffline ? (
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{t.offlineSaved}</p>
          ) : (
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{t.quoteUnavailableBody}</p>
          )
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {contactPhone && (
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#D4AF37] text-[#D4AF37] px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#1B3A57] transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {t.callUs}
            </a>
          )}
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-md bg-[#D4AF37] text-[#1B3A57] px-5 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 transition"
          >
            {t.bookAnother}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main form
  // -------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className={containerWrap}>
      {variant === 'standalone' && (
        <div className="mb-6">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{t.widgetTitle}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t.widgetSubtitle}</p>
        </div>
      )}

      {/* Offline banner — appears whenever the browser says we have no
          network connection. Disappears as soon as `online` fires. */}
      {isOffline && status !== 'quoted' && status !== 'pending' && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-md border border-amber-400/50 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          <svg className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          <div>
            <p className="font-semibold">{t.offlineBanner}</p>
            {offlineQueueSize > 0 && (
              <p className="mt-0.5 opacity-80">
                {offlineQueueSize === 1
                  ? `1 ${t.offlineRetrySoon}`
                  : `${offlineQueueSize} ${t.offlineRetrySoon}`}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <PlaceInput
          id="pickup"
          label={t.pickupLabel}
          placeholder={t.pickupPlaceholder}
          hint={t.pickupHint}
          value={pickup}
          onChange={setPickup}
          mapboxAccessToken={mapboxAccessToken}
          sessionToken={sessionToken}
          icon={<PinIcon />}
        />
        <PlaceInput
          id="dropoff"
          label={t.dropoffLabel}
          placeholder={t.dropoffPlaceholder}
          hint={t.dropoffHint}
          value={dropoff}
          onChange={setDropoff}
          mapboxAccessToken={mapboxAccessToken}
          sessionToken={sessionToken}
          icon={<FlagIcon />}
        />

        {/* Vehicle type — Car or Van. Drives both the capacity caps below
            and the fare formula on the server. Default to Van (the hero). */}
        <div>
          <p className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            {t.vehicleTitle}
          </p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t.vehicleTitle}>
            <button
              type="button"
              role="radio"
              aria-checked={vehicleType === 'car'}
              onClick={() => setVehicleType('car')}
              className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 min-h-[44px] text-left transition ${
                vehicleType === 'car'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]'
                  : 'border-gray-300 dark:border-white/15 hover:border-[#D4AF37]/50'
              }`}
            >
              <span className="flex flex-col">
                <span className={`text-sm font-bold ${vehicleType === 'car' ? 'text-[#0B1F33] dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {t.vehicleCarLabel}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.vehicleCarDesc}</span>
              </span>
              <CarIcon active={vehicleType === 'car'} />
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={vehicleType === 'van'}
              onClick={() => setVehicleType('van')}
              className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 min-h-[44px] text-left transition ${
                vehicleType === 'van'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]'
                  : 'border-gray-300 dark:border-white/15 hover:border-[#D4AF37]/50'
              }`}
            >
              <span className="flex flex-col">
                <span className={`text-sm font-bold ${vehicleType === 'van' ? 'text-[#0B1F33] dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {t.vehicleVanLabel}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{t.vehicleVanDesc}</span>
              </span>
              <VanIcon active={vehicleType === 'van'} />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="scheduledAt" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            {t.scheduledAtLabel}
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            min={minScheduledAt}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full min-h-[44px] rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-3 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] [color-scheme:dark]"
          />
          <p className={`mt-1 text-[11px] ${scheduledTooSoon ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {scheduledTooSoon ? t.errorMinLeadTime : t.scheduledHelp}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NumberField id="adults" label={t.adultsLabel} value={adults} min={1} max={vehicleType === 'car' ? 4 : 8} onChange={setAdults} />
          <NumberField id="children" label={t.childrenLabel} value={children} min={0} max={vehicleType === 'car' ? 4 : 8} onChange={setChildren} />
          <NumberField id="luggage-std" label={t.luggageStandardLabel} value={luggageStandard} min={0} max={vehicleType === 'car' ? 4 : 10} onChange={setLuggageStandard} />
          <NumberField id="luggage-hvy" label={t.luggageHeavyLabel} value={luggageHeavy} min={0} max={vehicleType === 'car' ? 4 : 10} onChange={setLuggageHeavy} />
        </div>

        {children > 0 && (
          <fieldset className="rounded-md border border-gray-200 dark:border-white/10 p-3">
            <legend className="px-2 text-[11px] uppercase tracking-wider font-bold text-gray-600 dark:text-gray-300">
              {t.childSeatsTitle}
            </legend>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <NumberField id="seat-infant" label={t.childSeatInfant} value={infantSeats} min={0} max={children} onChange={setInfantSeats} />
              <NumberField id="seat-toddler" label={t.childSeatToddler} value={toddlerSeats} min={0} max={children} onChange={setToddlerSeats} />
              <NumberField id="seat-booster" label={t.childSeatBooster} value={boosterSeats} min={0} max={children} onChange={setBoosterSeats} />
            </div>
            {seatsExceedChildren && (
              <p className="mt-2 text-xs text-red-500">{t.errorChildSeats}</p>
            )}
          </fieldset>
        )}

        {/* Contact toggle: keeps the widget short in the hero. */}
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="w-full inline-flex items-center justify-between rounded-md border border-dashed border-gray-300 dark:border-white/15 px-3 min-h-[44px] py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
          aria-expanded={advanced}
        >
          <span>{advanced ? '\u2212' : '+'} {t.contactTitle}</span>
        </button>

        {advanced && (
          <div className="grid sm:grid-cols-3 gap-2">
            <div>
              <label htmlFor="c-name" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{t.contactName}</label>
              <input id="c-name" type="text" autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)}
                className="w-full min-h-[44px] rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label htmlFor="c-email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{t.contactEmail}</label>
              <input id="c-email" type="email" autoComplete="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                className="w-full min-h-[44px] rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div>
              <label htmlFor="c-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{t.contactPhone}</label>
              <input id="c-phone" type="tel" autoComplete="tel" value={contactPhoneInput} onChange={(e) => setContactPhoneInput(e.target.value)}
                className="w-full min-h-[44px] rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{t.notesLabel}</label>
              <textarea id="notes" rows={2} maxLength={1000} placeholder={t.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[44px] rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" />
            </div>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div role="alert" className="rounded-md border border-red-400/50 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={formInvalid || status === 'submitting'}
          className="w-full inline-flex items-center justify-center rounded-md bg-[#D4AF37] text-[#1B3A57] px-6 py-4 text-base font-black uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {status === 'submitting' ? t.submitting : t.submit}
        </button>

        <TrustRow t={t} />
      </div>
    </form>
  );
};

export default BookingForm;
