# SEBCO Travels — production hosting notes

## SPA history fallback (required)

The site uses client-side routing for per-route SEO pages. Any request whose path is **not** a real file (e.g. `/airport-transfers/reading-heathrow`) must be rewritten to `/index.html` so the React router can take over.

Vite's dev server (`npm run dev`) already does this automatically.

For production hosts you must add a rewrite rule:

### nginx

```nginx
server {
  listen 443 ssl http2;
  server_name sebcotravels.co.uk;
  root /var/www/sebcotravels/dist;

  # Static files (CSS, JS, images, sitemap, robots) served directly.
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Long cache for fingerprinted assets:
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Proxy API calls to the Node backend:
  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Proxy Socket.io:
  location /socket.io/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

### Apache (.htaccess in the build output root)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Netlify (`public/_redirects`)

```
/api/*   https://api.sebcotravels.co.uk/api/:splat   200
/*       /index.html                                  200
```

### Vercel (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://api.sebcotravels.co.uk/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## After you have a real domain

1. Edit `public/sitemap.xml` — change every `https://sebcotravels.co.uk/...` to your real domain.
2. Edit `index.html` — same: update `og:url`, `twitter` URLs, JSON-LD `@id` / `url`.
3. Edit `public/robots.txt` — update the `Sitemap:` line.
4. Submit your sitemap to **Google Search Console** → Sitemaps → `https://yourdomain.com/sitemap.xml`.
5. Request indexing for each route page individually in Search Console (one-click per URL).
