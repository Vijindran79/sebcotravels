# Deploying SEBCO Travels to a Rocky Linux 9 VPS

> Target: **Rocky Linux 9** at `82.165.185.14` (or whichever public IP you provision).
> Final URL: `https://sebcotravels.co.uk` (or whatever domain you own).
> Stack: Node.js 20 + MongoDB + PM2 + Nginx + Let's Encrypt HTTPS.

This is a copy-paste guide. Run each block in order on a fresh server. Estimated total time: **~45 minutes** including DNS propagation.

---

## 0. Pre-flight checklist

You'll need:

- [ ] A VPS running Rocky Linux 9, reachable as `82.165.185.14`
- [ ] The **root password** (or sudo user) — **don't paste it in chat**; type it directly when SSH asks
- [ ] A **public SSH key** on your Windows machine (we'll generate one below if you don't have one)
- [ ] A **domain** whose DNS you control (e.g. `sebcotravels.co.uk`)
- [ ] Your real phone, in case Cloudflare / DNS asks for verification

> I (the agent) am **not** going to ask you to paste any password. If a future step needs you to share SSH access with me, we'll set up a **dedicated key** for the agent account that you can revoke instantly.

---

## 1. First-login server hardening (15 min, run as `root`)

```bash
# 1.1 Update everything
dnf update -y
dnf install -y epel-release yum-utils

# 1.2 Set the timezone (London for a UK chauffeur service)
timedatectl set-timezone Europe/London

# 1.3 Create a non-root user for the app (don't deploy as root)
useradd -m -s /bin/bash sebco
passwd sebco                          # you set the password on the VPS keyboard

# 1.4 Give sebco passwordless sudo (optional but convenient)
echo "sebco ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/sebco
chmod 440 /etc/sudoers.d/sebco

# 1.5 Lock down SSH
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/'           /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/'   /etc/ssh/sshd_config
systemctl restart sshd

# 1.6 Set up the firewall
dnf install -y firewalld
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 1.7 Add your SSH public key (paste the contents of
#     ~/.ssh/id_ed25519.pub on your Windows machine)
mkdir -p /home/sebco/.ssh
nano /home/sebco/.ssh/authorized_keys   # paste the key, Ctrl+O, Enter, Ctrl+X
chmod 700 /home/sebco/.ssh
chmod 600 /home/sebco/.ssh/authorized_keys
chown -R sebco:sebco /home/sebco/.ssh

# Test in a NEW SSH window before closing the old one:
#   ssh sebco@82.165.185.14
# If it works, you're done hardening.
```

> **From now on log in as `sebco@82.165.185.14`, never as `root`.**

---

## 2. Install runtime dependencies (10 min, as `sebco`)

```bash
sudo dnf install -y curl git nginx certbot python3-certbot-nginx

# 2.1 Node.js 20 LTS (via NodeSource)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version    # expect v20.x.x
npm --version

# 2.2 MongoDB Community 7 (RHEL-based repo)
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo > /dev/null <<'EOF'
[mongodb-org-7.0]
name=MongoDB Community 7.0
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
enabled=1
gpgcheck=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
sudo dnf install -y mongodb-org
sudo systemctl enable --now mongod
mongosh --eval 'db.runCommand({ ping: 1 })'   # expect { ok: 1 }

# 2.3 PM2 globally
sudo npm install -g pm2
pm2 --version

# 2.4 Auto-start PM2 on reboot
pm2 startup systemd -u sebco --hp /home/sebco
# That command prints another command like "sudo env PATH=..."
# Copy and run it.
```

---

## 3. Clone the repo + install deps (5 min)

```bash
cd /home/sebco
git clone https://github.com/<YOUR-GITHUB-USER>/sebco-travels.git app
cd app

# Backend
cd backend
npm ci --omit=dev
cp .env.example .env
nano .env       # fill in the real values: MONGO_URI, JWT_SECRET, STRIPE_*,
              # MAPBOX_ACCESS_TOKEN, BREVO_API_KEY, ALLOWED_ORIGINS=https://sebcotravels.co.uk
cd ..

# Frontend
cd ..
npm install
cp .env.example .env.local 2>/dev/null || true
# Edit .env.local so VITE_API_BASE_URL points to your domain
# VITE_API_BASE_URL=https://sebcotravels.co.uk
# VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# Build the production bundle
npm run build    # writes /home/sebco/app/dist
```

> The `JWT_SECRET` in `backend/.env` should be a long random string. Generate one with:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

---

## 4. Start the backend with PM2 (1 min)

```bash
cd /home/sebco/app
pm2 start backend/ecosystem.config.cjs --env production
pm2 save
pm2 status    # should show "sebco-travels-api" as "online"
pm2 logs sebco-travels-api --lines 50    # check no errors
```

The backend now runs as `sebco` user, on port 4000, starts on reboot.

---

## 5. Nginx: serve the frontend, proxy the backend (10 min)

```bash
# 5.1 Write the server block
sudo tee /etc/nginx/conf.d/sebco.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name sebcotravels.co.uk www.sebcotravels.co.uk;

    # ACME challenge (for Let's Encrypt)
    location /.well-known/acme-challenge/ { root /var/www/html; }

    # Redirect www to apex
    location / { return 301 https://sebcotravels.co.uk$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name www.sebcotravels.co.uk;
    ssl_certificate     /etc/letsencrypt/live/sebcotravels.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sebcotravels.co.uk/privkey.pem;
    return 301 https://sebcotravels.co.uk$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sebcotravels.co.uk;

    # SSL (will be filled in by certbot in step 6)
    ssl_certificate     /etc/letsencrypt/live/sebcotravels.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sebcotravels.co.uk/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend static files
    root /home/sebco/app/dist;
    index index.html;

    # SPA history fallback — /airport-transfers/reading-heathrow must serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Long cache for fingerprinted assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API -> backend
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io -> backend (WebSocket upgrade support)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_read_timeout 86400s;
    }
}
EOF

# 5.2 Allow HTTP + HTTPS through the firewall (already done in step 1.6)
# Test the config:
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. DNS + Let's Encrypt (10 min, mostly waiting for DNS)

```bash
# 6.1 In your DNS provider (Cloudflare, Namecheap, etc.) add an A record:
#     sebcotravels.co.uk     A    82.165.185.14
#     www.sebcotravels.co.uk  A    82.165.185.14
#
# Wait 1-5 minutes for DNS to propagate. Test:
dig +short sebcotravels.co.uk   # must return 82.165.185.14

# 6.2 Get the SSL cert
sudo certbot --nginx \
  -d sebcotravels.co.uk \
  -d www.sebcotravels.co.uk \
  --non-interactive --agree-tos -m caniseb1@gmail.com

# Certbot auto-edits the nginx config to point to the real certs.
# It also adds a cron job to renew the cert 30 days before expiry.
```

Your site is now live at **https://sebcotravels.co.uk** 🎉

---

## 7. Point the real Mapbox tokens at the domain

In your [Mapbox account](https://account.mapbox.com/access-tokens):

1. Find your `pk.eyJ1...` token
2. Click **URL restrictions** → **Add URL**
3. Add:
   - `https://sebcotravels.co.uk/*`
   - `https://www.sebcotravels.co.uk/*`
4. Save. The local-dev token (`http://localhost:3000/*`) is unaffected.

---

## 8. Final wiring (10 min)

| What | Where | Action |
| --- | --- | --- |
| Mapbox URL allowlist | Mapbox dashboard | Add `https://sebcotravels.co.uk/*` (see step 7) |
| Stripe webhook | https://dashboard.stripe.com/webhooks | Add endpoint `https://sebcotravels.co.uk/api/webhooks/stripe`, copy the signing secret into `STRIPE_WEBHOOK_SECRET` in `backend/.env` on the server, then `pm2 restart sebco-travels-api` |
| Brevo sender domain | https://app.brevo.com → Settings → Senders | Verify `sebcotravels.co.uk` (SPF + DKIM + return-path) and set `BREVO_FROM_EMAIL=bookings@sebcotravels.co.uk` on the server, then `pm2 restart sebco-travels-api` |
| Google Business Profile | https://business.google.com | Claim/verify the listing (see `docs/google-business-profile.md`) |
| Sitemap | Google Search Console | Submit `https://sebcotravels.co.uk/sitemap.xml` |

---

## 9. Operational habits (5 min, run once + ongoing)

```bash
# 9.1 MongoDB backup (daily, kept 7 days)
sudo tee /etc/cron.daily/mongo-backup > /dev/null <<'EOF'
#!/bin/bash
mongodump --uri="mongodb://127.0.0.1:27017/sebcotravels" \
  --gzip --archive=/home/sebco/backups/mongo-$(date +\%F).gz
find /home/sebco/backups -name 'mongo-*.gz' -mtime +7 -delete
EOF
sudo chmod +x /etc/cron.daily/mongo-backup
mkdir -p /home/sebco/backups
chown sebco:sebco /home/sebco/backups

# 9.2 Log rotation (PM2 already sets it up)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14

# 9.3 Auto security updates
sudo dnf install -y dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

---

## 10. Deploying a new version later (one line, every time you have new code)

```bash
ssh sebco@82.165.185.14
cd /home/sebco/app
git pull
npm install            # if package.json changed
npm run build          # rebuild frontend
cd backend && npm ci --omit=dev && cd ..
pm2 restart sebco-travels-api
```

That's it. ~5 seconds of downtime for the backend restart. Frontend is replaced atomically by Nginx serving the new `dist/` files.

---

## Cheat-sheet: when something goes wrong

```bash
# Backend down?
pm2 status
pm2 logs sebco-travels-api --lines 200 --nostream

# Backend not listening on 4000?
ss -tlnp | grep 4000

# Nginx not serving?
sudo nginx -t
sudo journalctl -u nginx --since '5 minutes ago'

# MongoDB down?
sudo systemctl status mongod
mongosh --eval 'db.runCommand({ ping: 1 })'

# SSL cert about to expire?
sudo certbot renew --dry-run
```

---

## When you're ready to hand me SSH access

Do **not** paste the root password into chat. Instead:

1. On the VPS, create a dedicated key for the agent:
   ```bash
   sudo useradd -m -s /bin/bash opencode-agent
   sudo -u opencode-agent ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519
   sudo cat /home/opencode-agent/.ssh/id_ed25519.pub >> /home/opencode-agent/.ssh/authorized_keys
   sudo chmod 700 /home/opencode-agent/.ssh
   sudo chmod 600 /home/opencode-agent/.ssh/authorized_keys
   sudo chown -R opencode-agent:opencode-agent /home/opencode-agent/.ssh
   sudo echo "opencode-agent ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/opencode-agent
   ```
2. Show me the **public** half of the key — the line in `/home/opencode-agent/.ssh/id_ed25519.pub`. You can keep the private half on the server.
3. I'll connect with the key, run all the commands above, hand you back the URLs, and you can `sudo userdel opencode-agent` at the end to revoke access instantly.

I will never need your password, your Brevo password, your Stripe secret key, your SSH private key, or any other credential. The API keys themselves (Mapbox, Brevo, Stripe) go in `backend/.env` on the server, not in my chat context.
