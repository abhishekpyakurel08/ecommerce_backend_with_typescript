import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.middleware";
import { Coupon } from "../model/coupon.models";
import { NewCouponRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { getStripe, createPaymentIntent as createStripePaymentIntent } from "../services/stripe.service";


export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount, orderId, userId } = req.body;
  if (!amount) {
    return next(new ErrorHandler('Please enter amount', 400));
  }

  // Add metadata for webhook processing
  const metadata: Record<string, string> = {};
  if (orderId) metadata.orderId = orderId;
  if (userId) metadata.userId = userId;

  const paymentIntent = await createStripePaymentIntent(amount, 'usd', metadata);

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

export const newCoupon = TryCatch(async (req: Request<{}, {}, NewCouponRequestBody>, res: Response, next: NextFunction) => {
  const { code, amount } = req.body
  if (!code || !amount) {
    return res.status(400).json({ message: "Coupon code and amount are required.", success: false });
  }
  const newCouponEntry = new Coupon({ code, amount });
  await newCouponEntry.save();
  return res.status(201).json({ message: "Coupon created successfully.", success: true, coupon: newCouponEntry });

})


export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.body;
  const discount = await Coupon.findOne({ code: coupon })
  if (!discount) {
    return res.status(404).json({ message: "Coupon not found.", success: false });
  }
  return res.status(200).json({ message: "Coupon applied successfully.", success: true, discount: discount.amount });
})


export const getAllCoupon = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({})
  return res.status(200).json({ message: "Coupons retrieved successfully.", success: true, coupons });

})

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found.", success: false });
  }
  return res.status(200).json({
    message: `Coupon ${coupon?.code} deleted successfully.`, success: true
  });

})