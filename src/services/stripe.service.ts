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
      apiVersion: '2025-03-31.basil',
    });
  }
  return stripeInstance;
};

// Generate unique idempotency key
const generateIdempotencyKey = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripe();
  try {
    const idempotencyKey = generateIdempotencyKey('pi');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: metadata || {},
    }, {
      idempotencyKey, // Prevent duplicate charges
    });

    logger.info('Payment intent created', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata
    });

    return paymentIntent;
  } catch (error) {
    logger.error('Stripe payment intent creation failed:', { error: (error as Error).message });
    throw error;
  }
};

// Retrieve payment intent status
export const retrievePaymentIntent = async (paymentIntentId: string): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripe();
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    logger.error('Failed to retrieve payment intent:', { error: (error as Error).message, paymentIntentId });
    throw error;
  }
};

// Refund a payment
export const createRefund = async (paymentIntentId: string, amount?: number): Promise<Stripe.Refund> => {
  const stripe = getStripe();
  try {
    const idempotencyKey = generateIdempotencyKey('refund');

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    }, {
      idempotencyKey,
    });

    logger.info('Refund created', { refundId: refund.id, paymentIntentId, amount });
    return refund;
  } catch (error) {
    logger.error('Refund creation failed:', { error: (error as Error).message, paymentIntentId });
    throw error;
  }
};
