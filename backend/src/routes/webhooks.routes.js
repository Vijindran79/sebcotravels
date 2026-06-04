// Stripe webhook endpoint. Mounted with a RAW body parser in app.js because
// the signature is computed over the unparsed bytes.
import { Router } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { stripe } from "../services/stripe.service.js";
import { Booking } from "../models/Booking.js";

const router = Router();

router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err: err.message }, "stripe webhook signature failed");
    return res.status(400).send(`Webhook signature error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        await Booking.updateOne(
          { stripePaymentIntentId: intent.id },
          {
            $set: {
              paymentStatus: "captured",
              stripeChargeId: intent.latest_charge || null,
            },
          }
        );
        break;
      }
      case "payment_intent.canceled": {
        const intent = event.data.object;
        await Booking.updateOne(
          { stripePaymentIntentId: intent.id, paymentStatus: { $ne: "captured" } },
          { $set: { paymentStatus: "cancelled" } }
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        await Booking.updateOne(
          { stripePaymentIntentId: intent.id },
          { $set: { paymentStatus: "failed" } }
        );
        break;
      }
      default:
        logger.debug({ type: event.type }, "stripe webhook: unhandled event");
    }
    res.json({ received: true });
  } catch (err) {
    logger.error({ err, type: event.type }, "stripe webhook handler failed");
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;
