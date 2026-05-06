import { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config";
import { getStripe } from "../services/stripe.service";
import { Order } from "../model/order.models";
import { logger } from "../utils/logger";

// Stripe webhook handler for production-ready payment processing
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const stripe = getStripe();

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  logger.info(`Webhook received: ${event.type}`, { eventId: event.id });

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error: any) {
    logger.error(`Error processing webhook: ${error.message}`, { event: event.type });
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    logger.error("No orderId in payment intent metadata", { paymentIntentId: paymentIntent.id });
    return;
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      logger.error("Order not found for payment", { orderId, paymentIntentId: paymentIntent.id });
      return;
    }

    // Update order payment status
    if (!order.paymentInfo) {
      order.paymentInfo = { id: paymentIntent.id, status: "succeeded", method: "card", paidAt: new Date() };
    } else {
      order.paymentInfo.status = "succeeded";
      order.paymentInfo.paidAt = new Date();
    }
    order.status = "Processing";
    await order.save();

    logger.info(`Payment succeeded for order ${orderId}`, {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    });
  } catch (error: any) {
    logger.error(`Failed to update order on payment success: ${error.message}`, { orderId });
    throw error;
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    logger.error("No orderId in failed payment intent", { paymentIntentId: paymentIntent.id });
    return;
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        "paymentInfo.status": "failed",
        status: "cancelled"
      },
      { new: true }
    );

    if (!order) {
      logger.error("Order not found for failed payment", { orderId });
      return;
    }

    logger.info(`Payment failed for order ${orderId}`, {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message
    });
  } catch (error: any) {
    logger.error(`Failed to update order on payment failure: ${error.message}`, { orderId });
    throw error;
  }
}

// Handle refund
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    logger.error("No payment intent in charge refund", { chargeId: charge.id });
    return;
  }

  try {
    const order = await Order.findOne({ "paymentInfo.id": paymentIntentId });

    if (!order) {
      logger.error("Order not found for refund", { paymentIntentId });
      return;
    }

    if (order.paymentInfo) {
      order.paymentInfo.status = "refunded";
    }
    order.status = "cancelled";
    await order.save();

    logger.info(`Order ${order._id} marked as refunded`, {
      paymentIntentId,
      amountRefunded: charge.amount_refunded
    });
  } catch (error: any) {
    logger.error(`Failed to process refund: ${error.message}`, { paymentIntentId });
    throw error;
  }
}

// Handle canceled payment
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    logger.error("No orderId in canceled payment intent", { paymentIntentId: paymentIntent.id });
    return;
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        "paymentInfo.status": "cancelled",
        status: "cancelled"
      },
      { new: true }
    );

    if (!order) {
      logger.error("Order not found for canceled payment", { orderId });
      return;
    }

    logger.info(`Payment canceled for order ${orderId}`, { paymentIntentId: paymentIntent.id });
  } catch (error: any) {
    logger.error(`Failed to update order on cancel: ${error.message}`, { orderId });
    throw error;
  }
}
