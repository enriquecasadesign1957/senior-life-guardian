import Stripe from "stripe";

let stripe: Stripe | null = null;
let stripeKey: string | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe || stripeKey !== key) {
    stripe = new Stripe(key);
    stripeKey = key;
  }
  return stripe;
}

export function appOrigin(request: Request): string {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured && /^https?:\/\/[^/]+$/.test(configured)) return configured;
  return new URL(request.url).origin;
}
