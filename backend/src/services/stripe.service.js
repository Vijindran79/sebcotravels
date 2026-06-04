// Stripe wrapper: PaymentIntent with manual capture, plus capture/cancel
// helpers. Webhook signature verification is in the webhooks route.
import Stripe from "stripe";
import { env } from "../config/env.js";
import { toStripeAmount } from "./pricing.service.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: false,
});

export async function authorizePayment({ amountMajor, currency, bookingId, customerId, metadata = {} }) {
  return stripe.paymentIntents.create({
    amount: toStripeAmount(amountMajor),
    currency,
    capture_method: "manual",
    confirm: false,
    customer: customerId || undefined,
    metadata: { bookingId, ...metadata },
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    description: `Sebco Travels booking ${bookingId}`,
  });
}

export async function capturePayment(paymentIntentId) {
  return stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelPayment(paymentIntentId, reason = "requested_by_customer") {
  return stripe.paymentIntents.cancel(paymentIntentId, { cancellation_reason: reason });
}

export async function ensureCustomer(user) {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    phone: user.phone,
    metadata: { userId: user._id.toString() },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}
