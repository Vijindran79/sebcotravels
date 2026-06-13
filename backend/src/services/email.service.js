// Transactional email + SMS via Brevo.
//
// Brevo v3 REST API — no SDK needed, just fetch().
// Docs: https://developers.brevo.com/reference/sendtransacemail
//
// Behaviour:
// - If BREVO_API_KEY is empty, every send*() call is a no-op and returns
//   { skipped: true, reason: 'not_configured' }. The booking flow keeps
//   working; the operator just doesn't receive an email notification.
// - If the daily free-tier quota (300) is reached we stop sending for
//   the rest of the day (safety margin at 280).
// - Errors are logged but never thrown, so a failed email never fails
//   the user's booking.

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const DAILY_LIMIT = 280; // safety margin under the 300/day free tier

// In-process daily counter. Resets at midnight (server local time).
let _emailsSentToday = 0;
let _lastResetDate = new Date().toDateString();

function _rollIfNewDay() {
  const today = new Date().toDateString();
  if (today !== _lastResetDate) {
    _emailsSentToday = 0;
    _lastResetDate = today;
  }
}

// ---------------------------------------------------------------------------
// Public template helpers. Plain HTML with a small inline <style> block so it
// renders nicely in Gmail / Outlook / Apple Mail without external assets.
// ---------------------------------------------------------------------------

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatScheduled(d) {
  try {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}

function customerConfirmationHtml(lead) {
  const name = escapeHtml(lead.contact.name);
  const refId = escapeHtml(lead.refId);
  const pickupAddr = escapeHtml(lead.pickup.address);
  const dropoffAddr = escapeHtml(lead.dropoff.address);
  const when = escapeHtml(formatScheduled(lead.scheduledFor));
  const fareRow = lead.fare
    ? `<tr><td style="padding:8px 0;color:#666;">Fixed price</td><td style="padding:8px 0;font-weight:bold;color:#D4AF37;font-size:18px;">&pound;${Number(lead.fare.total).toFixed(2)}</td></tr>`
    : '';
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>SEBCO Travels</title></head>
<body style="margin:0;padding:0;background:#0B1F33;font-family:Montserrat,Helvetica,Arial,sans-serif;color:#222;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0B1F33;padding:32px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
      <tr><td style="background:#0B1F33;padding:24px 32px;">
        <div style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-weight:900;font-size:22px;letter-spacing:-0.02em;color:#fff;">SEBCO <span style="color:#D4AF37;">Travels</span></div>
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#D4AF37;margin-top:4px;">First Class Ground Transportation</div>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 8px 0;font-size:24px;color:#0B1F33;">Thank you, ${name}!</h1>
        <p style="margin:0 0 24px 0;color:#555;line-height:1.5;">Your pre-booking is received. We&rsquo;ll call you on the number you provided to confirm every detail. You only pay after the journey is complete.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eee;border-bottom:1px solid #eee;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#666;width:140px;">Booking ref</td><td style="padding:8px 0;font-family:'Courier New',monospace;font-weight:bold;">${refId}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Pick-up</td><td style="padding:8px 0;">${pickupAddr}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Drop-off</td><td style="padding:8px 0;">${dropoffAddr}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">When</td><td style="padding:8px 0;font-weight:bold;">${when}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Passengers</td><td style="padding:8px 0;">${lead.passengers.adults} adult${lead.passengers.adults !== 1 ? 's' : ''} &middot; ${lead.passengers.children} child${lead.passengers.children !== 1 ? 'ren' : ''}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Luggage</td><td style="padding:8px 0;">${lead.luggage.standard} standard &middot; ${lead.luggage.heavy} heavy</td></tr>
          ${fareRow}
        </table>
        <p style="margin:0 0 24px 0;color:#555;line-height:1.5;">If anything changes, just reply to this email or call <a href="tel:+447411113636" style="color:#0B1F33;font-weight:bold;">+44 7411 113636</a>.</p>
        <p style="margin:0;color:#999;font-size:12px;">SEBCO Travels Ltd &middot; Executive MPV &middot; <a href="https://sebcotravels.co.uk" style="color:#999;">sebcotravels.co.uk</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function customerConfirmationText(lead) {
  return [
    `Thank you, ${lead.contact.name}!`,
    '',
    'Your SEBCO Travels pre-booking is received. We will call you on the number you provided to confirm every detail. You only pay after the journey is complete.',
    '',
    `  Booking ref: ${lead.refId}`,
    `  Pick-up:     ${lead.pickup.address}`,
    `  Drop-off:   ${lead.dropoff.address}`,
    `  When:       ${formatScheduled(lead.scheduledFor)}`,
    `  Passengers: ${lead.passengers.adults} adults + ${lead.passengers.children} children`,
    `  Luggage:    ${lead.luggage.standard} standard + ${lead.luggage.heavy} heavy`,
    lead.fare ? `  Fixed price: £${Number(lead.fare.total).toFixed(2)}` : null,
    '',
    'If anything changes, reply to this email or call +44 7411 113636.',
    '',
    'SEBCO Travels Ltd',
  ].filter(Boolean).join('\n');
}

function operatorNotificationHtml(lead) {
  const name = escapeHtml(lead.contact.name);
  const phone = escapeHtml(lead.contact.phone);
  const email = escapeHtml(lead.contact.email);
  const pickupAddr = escapeHtml(lead.pickup.address);
  const dropoffAddr = escapeHtml(lead.dropoff.address);
  const when = escapeHtml(formatScheduled(lead.scheduledFor));
  const refId = escapeHtml(lead.refId);
  const seats = lead.childSeats
    ? `${lead.childSeats.infant || 0} infant · ${lead.childSeats.toddler || 0} toddler · ${lead.childSeats.booster || 0} booster`
    : 'none';
  const notes = lead.notes
    ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top;">Notes</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(lead.notes)}</td></tr>`
    : '';
  const fareRow = lead.fare
    ? `<tr><td style="padding:8px 0;color:#666;">Fixed price</td><td style="padding:8px 0;font-weight:bold;color:#D4AF37;">&pound;${Number(lead.fare.total).toFixed(2)} (${Number(lead.fare.distanceMiles).toFixed(1)} mi)</td></tr>`
    : '';
  const adminLink = `${env.BREVO_SITE_ORIGIN}/admin/leads/${refId}`;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>New pre-booking</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Montserrat,Helvetica,Arial,sans-serif;color:#222;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#0B1F33;border-radius:8px 8px 0 0;">
      <tr><td style="padding:18px 28px;">
        <div style="font-weight:900;font-size:18px;color:#fff;">SEBCO <span style="color:#D4AF37;">Travels</span></div>
        <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#D4AF37;margin-top:4px;">New pre-booking</div>
      </td></tr>
    </table>
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:0 0 8px 8px;max-width:600px;">
      <tr><td style="padding:28px;">
        <h1 style="margin:0 0 6px 0;font-size:22px;color:#0B1F33;">${name}</h1>
        <p style="margin:0 0 4px 0;color:#555;"><a href="tel:${phone}" style="color:#0B1F33;font-weight:bold;">${phone}</a></p>
        <p style="margin:0;color:#555;"><a href="mailto:${email}" style="color:#0B1F37;">${email}</a></p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eee;margin:20px 0;">
          <tr><td style="padding:8px 0;color:#666;width:140px;">Ref</td><td style="padding:8px 0;font-family:'Courier New',monospace;font-weight:bold;">${refId}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Pick-up</td><td style="padding:8px 0;">${pickupAddr}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Drop-off</td><td style="padding:8px 0;">${dropoffAddr}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">When</td><td style="padding:8px 0;font-weight:bold;">${when}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Passengers</td><td style="padding:8px 0;">${lead.passengers.adults} adults + ${lead.passengers.children} children</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Luggage</td><td style="padding:8px 0;">${lead.luggage.standard} standard + ${lead.luggage.heavy} heavy</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Child seats</td><td style="padding:8px 0;">${seats}</td></tr>
          ${fareRow}
          ${notes}
        </table>
        <a href="${adminLink}" style="display:inline-block;background:#D4AF37;color:#1B3A57;padding:12px 20px;border-radius:4px;font-weight:bold;text-decoration:none;">Open in admin &rarr;</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function operatorNotificationText(lead) {
  return [
    `New pre-booking — ${lead.refId}`,
    '',
    `Name:       ${lead.contact.name}`,
    `Phone:      ${lead.contact.phone}`,
    `Email:      ${lead.contact.email}`,
    '',
    `Pick-up:    ${lead.pickup.address}`,
    `Drop-off:   ${lead.dropoff.address}`,
    `When:       ${formatScheduled(lead.scheduledFor)}`,
    '',
    `Passengers: ${lead.passengers.adults} adults + ${lead.passengers.children} children`,
    `Luggage:    ${lead.luggage.standard} standard + ${lead.luggage.heavy} heavy`,
    `Child seats: ${lead.childSeats.infant || 0} infant · ${lead.childSeats.toddler || 0} toddler · ${lead.childSeats.booster || 0} booster`,
    lead.fare ? `Fixed price: £${Number(lead.fare.total).toFixed(2)} (${Number(lead.fare.distanceMiles).toFixed(1)} mi)` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    '',
    `Open in admin: ${env.BREVO_SITE_ORIGIN}/admin/leads/${lead.refId}`,
  ].filter(Boolean).join('\n');
}

// ---------------------------------------------------------------------------
// Transport: Brevo v3 REST API
// ---------------------------------------------------------------------------

async function sendViaBrevo({ to, subject, htmlContent, textContent }) {
  if (!env.BREVO_API_KEY) {
    logger.warn({ to: to.email }, 'Brevo not configured (BREVO_API_KEY missing). Skipping email.');
    return { skipped: true, reason: 'not_configured' };
  }
  _rollIfNewDay();
  if (_emailsSentToday >= DAILY_LIMIT) {
    logger.warn({ to: to.email, sentToday: _emailsSentToday }, 'Brevo daily limit reached. Skipping email.');
    return { skipped: true, reason: 'daily_limit' };
  }

  const body = {
    sender: { name: env.BREVO_FROM_NAME, email: env.BREVO_FROM_EMAIL },
    to: Array.isArray(to) ? to : [{ email: to.email, name: to.name }],
    subject,
    htmlContent,
    textContent,
  };

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      logger.error({ status: res.status, to: to.email, body: txt.slice(0, 400) }, 'Brevo send failed');
      return { sent: false, error: txt };
    }
    const data = await res.json().catch(() => ({}));
    _emailsSentToday++;
    logger.info({ messageId: data.messageId, to: to.email, subject }, 'Brevo email sent');
    return { sent: true, messageId: data.messageId };
  } catch (err) {
    logger.error({ err: err.message, to: to.email }, 'Brevo threw');
    return { sent: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Public API used by the controllers
// ---------------------------------------------------------------------------

export async function sendCustomerConfirmation(lead) {
  return sendViaBrevo({
    to: { email: lead.contact.email, name: lead.contact.name },
    subject: `SEBCO Travels — your booking is received (${lead.refId})`,
    htmlContent: customerConfirmationHtml(lead),
    textContent: customerConfirmationText(lead),
  });
}

export async function sendOperatorNotification(lead) {
  if (!env.BREVO_OPERATOR_EMAIL) {
    logger.warn('No BREVO_OPERATOR_EMAIL configured. Skipping operator notification.');
    return { skipped: true, reason: 'no_operator_email' };
  }
  return sendViaBrevo({
    to: { email: env.BREVO_OPERATOR_EMAIL, name: 'SEBCO Travels Operator' },
    subject: `New pre-booking — ${lead.contact.name} · ${formatScheduled(lead.scheduledFor)}`,
    htmlContent: operatorNotificationHtml(lead),
    textContent: operatorNotificationText(lead),
  });
}

/**
 * Send both emails. Failures are swallowed and logged; the booking
 * flow does NOT depend on email delivery.
 */
export async function sendLeadNotifications(lead) {
  const [customer, operator] = await Promise.allSettled([
    sendCustomerConfirmation(lead),
    sendOperatorNotification(lead),
  ]);
  if (customer.status === 'rejected') logger.error({ err: customer.reason }, 'Customer email failed');
  if (operator.status === 'rejected') logger.error({ err: operator.reason }, 'Operator email failed');
  return {
    customer: customer.status === 'fulfilled' ? customer.value : null,
    operator: operator.status === 'fulfilled' ? operator.value : null,
  };
}
