import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('Defina STRIPE_SECRET_KEY.');
  }
  stripeSingleton = new Stripe(key, {
    typescript: true,
  });
  return stripeSingleton;
}
