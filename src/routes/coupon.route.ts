import express from "express"
import { authenticate, adminOnly } from "../middleware/auth.middleware"
import { applyDiscount, deleteCoupon, newCoupon, getAllCoupon, createPaymentIntent } from "../controllers/coupon.controllers"

const router = express.Router()

// Payment paths (used with /payments base)
router.route("/create").post(createPaymentIntent)
router.route("/discount").post(applyDiscount)

// Coupon paths (used with /coupon base)
router.route("/new").post(authenticate, adminOnly, newCoupon)
router.route("/all").get(authenticate, adminOnly, getAllCoupon)
router.route("/:id").delete(authenticate, adminOnly, deleteCoupon)

export default router