import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../utils/logger';

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!config.STRIPE_KEY) {
      logger.warn('STRIPE_KEY not configured, Stripe functionality will not work');
    }
    stripeInstance = new Stripe(config.STRIPE_KEY, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripeInstance;
};

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd'
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripe();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
  } catch (error) {
    logger.error('Stripe payment intent creation failed:', { error: (error as Error).message });
    throw error;
  }
};
