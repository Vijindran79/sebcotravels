# Photography swap guide — SEBCO Travels

Right now the site uses two placeholder photos from Unsplash so it looks professional out of the box. They are temporary. As soon as you have your own photos of the **black Citroën SpaceTourer**, drop them in and the site will use yours automatically — no code changes needed.

This guide tells you exactly which photos to take, what size to make them, what filenames to use, and where to put them.

---

## TL;DR — The 4 photos you need

| Filename to save it as | Where it appears | Size (px) | What to shoot |
| --- | --- | --- | --- |
| `public/img/hero.jpg`              | Full-bleed background of the dark hero on every page (home + 6 route pages) | **2400 × 1350** (16:9) | 3/4 front view of the **clean, black SpaceTourer**, golden-hour daylight, dark moody background (sunset, airport at dusk, country road). Slight motion blur on the wheels OK. |
| `public/img/fleet-spacetourer.jpg` | Card in the "Our Premium Fleet" section | **1200 × 675** (16:9) | Static side-profile of the van against a clean background (white wall, brick, neutral). All doors closed, plates legible. |
| `public/img/interior.jpg`          | Reserved for a future section (already used in JSON-LD) | **1600 × 900** (16:9) | Interior shot looking from the back row toward the front. Leather seats clean, USB ports visible, child seat fitted if possible. |
| `public/og-image.jpg`              | Social-media share preview (Facebook, WhatsApp, Twitter) | **1200 × 630** (1.91:1) | Same as hero but cropped tighter — should show SEBCO logo overlay if possible. Avoid important detail in the bottom right corner (some platforms crop it). |

> All four photos go in the **`public/`** folder of the repo. Vite serves anything in `public/` at the root URL with the same filename, so `public/img/hero.jpg` becomes `https://yourdomain.com/img/hero.jpg`.

---

## Step-by-step

### 1. Take the photos

**Equipment:** modern smartphone in 4K, held horizontally. No need for a real camera. Avoid HDR mode (it flattens the black paintwork).

**Best times:**
- **Hero shot**: 45 minutes before sunset (golden hour). The low sun lights the side of the black van without harsh shadows.
- **Fleet shot**: midday, slight cloud cover. Even lighting, no glare.
- **Interior shot**: any time, doors open, all interior lights on, second smartphone as a fill light from the boot.

**Composition:**
- Hero: **rule of thirds** — van occupies the right two-thirds, sky/road fills the left. Leave empty space top-left for headline copy.
- Fleet: **dead centre, side-on**, parked on level ground.
- Interior: shoot from the very back, **down the centre aisle**, with the dashboard visible at the far end.

### 2. Edit on your phone

Use the free **Snapseed** app (iPhone / Android):

1. *Tools → Tune Image* → drop Brightness −10, raise Contrast +20, raise Saturation +15
2. *Tools → Details* → Sharpening +25
3. *Tools → Selective* → tap the van body, raise Brightness slightly so the black panels don't crush to pure black
4. *Tools → White Balance* → nudge cooler for hero / fleet, neutral for interior
5. Export at *High Quality* (saves to camera roll)

### 3. Resize + compress

Drop each image into **https://squoosh.app** (free, no signup, browser-only — your photo never leaves your device).

- Format: **MozJPEG** quality 80 (great quality, ~10× smaller than the original)
- Resize: match the target px from the table above. Tick "Maintain aspect ratio".
- Download.

Target final filesize: **under 300 KB** for hero, under 200 KB for the others. Big images murder mobile load speed and hurt your Google ranking.

### 4. Drop the files into the repo

Create the folder if it doesn't exist:

```powershell
New-Item -ItemType Directory -Path "public\img" -Force
```

Save the 4 files into:

```
public/
├── og-image.jpg                  (1200x630)
└── img/
    ├── hero.jpg                  (2400x1350)
    ├── fleet-spacetourer.jpg     (1200x675)
    └── interior.jpg              (1600x900)
```

### 5. Switch the code from Unsplash to your photos

Open the source files and change two lines:

#### `App.tsx`

Find the `HERO_IMAGE` constant near the top:

```ts
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400&auto=format&fit=crop';
```

Replace with:

```ts
const HERO_IMAGE = '/img/hero.jpg';
```

Find the FleetCard call (search the file for `// TODO: replace with /img/citroen-spacetourer.jpg`):

```tsx
<FleetCard
  // TODO: replace with /img/citroen-spacetourer.jpg — see docs/photography.md
  image="https://images.unsplash.com/photo-1582453699396-3a8a2d103b41?q=80&w=2070&auto=format&fit=crop"
  ...
/>
```

Replace with:

```tsx
<FleetCard
  image="/img/fleet-spacetourer.jpg"
  ...
/>
```

#### `RoutePages.tsx`

Find the `HERO_IMAGE` constant near the bottom of the imports / top of the icons section:

```ts
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400&auto=format&fit=crop';
```

Replace with:

```ts
const HERO_IMAGE = '/img/hero.jpg';
```

#### `index.html`

Find every reference to `og-image.jpg` (there are three: `og:image`, `twitter:image`, and `image` in the JSON-LD). They already point to `https://sebcotravels.co.uk/og-image.jpg` — once you point your real domain there it just works.

### 6. Restart and confirm

```powershell
npm run dev
```

Hard-refresh the browser (Ctrl-F5). You should now see your van in the hero, your fleet card photo, and your social share preview.

---

## Bonus — quick-win photos to add later

These aren't required, but each one adds another touch point to the site and to your Google Business Profile (see `docs/google-business-profile.md`):

| Filename | Subject |
| --- | --- |
| `/img/boot-luggage.jpg`      | Boot open, 8 large suitcases visibly fitting |
| `/img/child-seat.jpg`        | All 3 child seats fitted on the rear bench |
| `/img/driver-portrait.jpg`   | You in chauffeur attire (suit, tie, gloves), full-length, neutral background |
| `/img/heathrow-arrival.jpg`  | Van parked at Heathrow short-stay, in chauffeur attire holding a name board |
| `/img/wedding.jpg`           | Decorated van at a wedding venue (ribbon on bonnet) |

Drop them in `public/img/`. Then ping me with the filenames and I'll wire them into specific sections of the site (testimonial portraits, route pages, services cards).

---

## Brand-consistency cheat sheet

- **Colour grading**: keep blacks rich but not crushed; gold accents (#D4AF37) should never appear in the photos themselves — let the website chrome supply the gold.
- **No people in stock-style poses.** Real chauffeur, real driver, real passengers (with their permission). Authenticity outperforms agency photography for small premium operators.
- **No competitor liveries** in the background.
- **No visible UK numberplates** of customer vehicles if avoidable (privacy). Yours is fine.
- **Landscape orientation only** for hero / fleet / interior. Portrait shots break the layout.
