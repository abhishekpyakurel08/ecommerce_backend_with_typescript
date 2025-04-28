import express from "express"
import { ADMINONLY } from "../middleware/auth.middleware"
import { applyDiscount, deleteCoupon, newCoupon,getAllCoupon, createPaymentIntent } from "../controllers/coupon.controllers"


const router = express.Router()


router.route("/create").post(createPaymentIntent)
router.route("/coupon/new").post(ADMINONLY,newCoupon)
router.route("/discount").post(applyDiscount)
router.route("/all/coupon").get(ADMINONLY,getAllCoupon)
router.route("/coupon/:id").delete(ADMINONLY,deleteCoupon)

export default router