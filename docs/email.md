# Email & SMS notifications — Brevo setup

This is the step-by-step for wiring the SEBCO Travels backend to your **existing Brevo account** so that:

1. The **customer** gets a polished "your booking is received" email with their booking ref + fixed price + pick-up time
2. **You (the operator)** get an email with the full customer details so you can call them back to confirm
3. (Optional later) **SMS** confirmation to the customer

> ⚠️  **Never share your Brevo login or password with anyone** — including AI agents. We only need a **v3 API key** that you create in the dashboard. Treat it like a database password.

---

## TL;DR — 90 seconds

1. Log in at https://app.brevo.com (the same place you manage your other app)
2. **Settings → SMTP & API → API Keys** → **Generate a new API key**
3. Name it `SEBCO Travels`, leave the **v3** scope ticked, click **Generate**
4. Copy the key (you'll only see it once — looks like `xkeysib-…`)
5. Paste it into `backend/.env` as `BREVO_API_KEY=xkeysib-…`
6. Restart the backend. Done.

---

## Step 1 — Sign in to Brevo (30 sec)

Open https://app.brevo.com in your browser. Sign in with the same account that has the other app. The free tier includes **300 emails/day** which is plenty for the first months of SEBCO.

> The 300/day counter is on the *account*, not per app. So if your other app uses ~50/day, you have 250 left for SEBCO. If you go over, Brevo charges per extra email (cheap) and the backend just keeps going — it never blocks a booking.

## Step 2 — Create a dedicated API key (60 sec)

1. Click your **profile avatar (top right)** → **Settings**
2. In the left sidebar click **SMTP & API** (under "Your account")
3. Click the **API Keys** tab
4. Click the **Generate a new API key** button
5. In the popup:
   - **Name**: `SEBCO Travels`
   - **Scopes**: tick **v3** (this is the only one our backend uses)
   - Click **Generate**
6. Brevo shows the key ONCE. Click the **copy** icon.
   - It looks like: `xkeysib-1a2b3c4d5e6f...` (a long random string)

> **Save it now.** If you close the popup, you can't see it again — you'd have to revoke and create a new one.

## Step 3 — Add it to your local `.env` (30 sec)

Open `backend/.env` (copy from `backend/.env.example` if you don't have one yet) and paste the key. Fill in the rest too:

```bash
# Brevo transactional email
BREVO_API_KEY=xkeysib-1a2b3c4d5e6f...
BREVO_FROM_NAME=SEBCO Travels
BREVO_FROM_EMAIL=bookings@sebcotravels.co.uk
BREVO_OPERATOR_EMAIL=caniseb1@gmail.com

# Leave these off for now; the docs explain later
BREVO_SMS_ENABLED=false
```

A few important things:

- **`BREVO_FROM_EMAIL`** must be a domain you own and have **verified in Brevo** (Settings → Senders & Domains → Domains → Add a domain → follow the DNS instructions). If you haven't done this yet, use the free Brevo-shared domain for now: set it to `sebcotravels.co.uk` IF you own that domain, or use the default `newsletter@sebcotravels.co.uk` address Brevo provides for testing. The email will still go out, just with a "via brevo.com" tag in Gmail.
- **`BREVO_OPERATOR_EMAIL`** is where YOU get the "new pre-booking" email. It already has your `caniseb1@gmail.com` as a default — change it if you have a different one.
- Until you fill in these env vars and restart the backend, **the booking flow still works** — emails are just silently skipped. So you can launch the site today and add Brevo later.

## Step 4 — Test it works (60 sec)

1. Restart the backend:
   ```bash
   cd backend
   npm run dev
   ```
2. From the website, submit the booking form with **your own email address** in the contact field
3. Within 10 seconds you should receive two emails:
   - **From: SEBCO Travels** → your inbox, with the booking ref + fixed price
   - **To: caniseb1@gmail.com** → your operator inbox, with the full customer details
4. If nothing arrives, check the backend terminal — every send (success or failure) is logged.

### Common issues

| Problem | Fix |
| --- | --- |
| No emails at all | `BREVO_API_KEY` not set, or backend not restarted after adding it. Check the terminal logs — the line `Brevo not configured (BREVO_API_KEY missing)` confirms it. |
| 401 Unauthorized in the log | The key was revoked, or you copied a v2 key instead of v3. Re-generate. |
| 403 Forbidden in the log | The key's scope isn't v3. Edit the key in Brevo and tick v3. |
| Email goes to spam | You haven't verified `BREVO_FROM_EMAIL` as a sender. Either verify the domain in Brevo (Settings → Senders) or change `BREVO_FROM_EMAIL` to your Brevo account's default `newsletter@…` address. |
| Gmail shows "via brevo.com" | Same as above — means you're using Brevo's shared domain. Looks slightly less professional but is fine for now. |

---

## Verifying your domain (recommended for production)

When you go live you want emails to come from `bookings@sebcotravels.co.uk` (not from a `brevo.com` address). To do that:

1. In Brevo: **Settings → Senders & Domains → Domains → Add a domain**
2. Enter `sebcotravels.co.uk`
3. Brevo gives you **3 DNS records** to add at your domain registrar (e.g. Cloudflare, Namecheap):
   - An SPF record (TXT)
   - A DKIM record (TXT)
   - A return-path (CNAME)
4. Add them, wait 5–30 minutes for DNS to propagate, click **Verify** in Brevo
5. Once verified, change `BREVO_FROM_EMAIL` in `backend/.env` to `bookings@sebcotravels.co.uk` and restart

Total time: ~10 minutes. Do it on a weekday, never on a Friday night.

---

## SMS (optional, costs extra)

Brevo's free tier includes **0 SMS**. SMS is paid per message (around €0.04–€0.07/SMS in the UK). For a UK private-hire business, SMS is worth it for:

- **Driver dispatch notifications** (when you wire instant booking): SMS the chauffeur when a job is offered
- **Customer "driver is 5 mins away"** alerts

To enable SMS later:

1. Buy SMS credits in Brevo: **Transactions → SMS → Buy credits**
2. In `backend/.env`:
   ```
   BREVO_SMS_ENABLED=true
   BREVO_OPERATOR_PHONE=+447411113636
   ```
3. The email service already includes a stub for SMS — say "enable SMS notifications" and I'll add the dispatch-time SMS to the appropriate backend handler.

---

## What gets sent (and when)

| Event | Email to customer | Email to you (operator) | SMS |
| --- | --- | --- | --- |
| Someone submits the booking form (lead) | ✅ "your booking is received" with ref + price | ✅ Full customer details | ❌ |
| Authenticated user books via the API (booking) | ✅ Same template | ✅ Same template | ❌ |
| Booking status changes (e.g. cancelled) | TODO — not yet implemented | TODO | ❌ |
| Driver accepted / en-route / arrived | TODO | TODO | TODO |

The first two are wired up now. The rest are easy follow-ups — say the word and I'll add them.

---

## Cost at scale

- 0–300 emails/day: **free**
- 300–20,000 emails/day: **€0.00045 per email** (≈ £0.0004)
- 1,000 bookings/month ≈ 2,000 emails (customer + operator) = **≈ €0.90/month**
- 10,000 bookings/month ≈ **≈ €9/month** — still tiny

So Brevo is essentially free until you're running a real business, and the cost stays negligible even at serious scale.
