"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const coupon_controllers_1 = require("../controllers/coupon.controllers");
const router = express_1.default.Router();
router.route("/create").post(coupon_controllers_1.createPaymentIntent);
router.route("/coupon/new").post(auth_middleware_1.ADMINONLY, coupon_controllers_1.newCoupon);
router.route("/discount").post(coupon_controllers_1.applyDiscount);
router.route("/all/coupon").get(auth_middleware_1.ADMINONLY, coupon_controllers_1.getAllCoupon);
router.route("/coupon/:id").delete(auth_middleware_1.ADMINONLY, coupon_controllers_1.deleteCoupon);
exports.default = router;
