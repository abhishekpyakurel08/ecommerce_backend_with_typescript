"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.getAllCoupon = exports.applyDiscount = exports.newCoupon = exports.createPaymentIntent = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const coupon_models_1 = require("../model/coupon.models");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const app_1 = require("../app");
exports.createPaymentIntent = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    if (!amount) {
        return next(new utility_class_1.default("Please enter amount ", 400));
    }
    const paymnetIntent = yield app_1.stripe.paymentIntents.create({
        amount: amount, currency: "usd"
    });
    return res.status(201).json({
        success: true,
        clinetSecret: paymnetIntent.client_secret
    });
}));
exports.newCoupon = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, amount } = req.body;
    if (!code || !amount) {
        return res.status(400).json({ message: "Coupon and amount are required.", success: false });
    }
    const newCouponEntry = new coupon_models_1.Coupon({ coupon: code, amount });
    yield newCouponEntry.save();
    return res.status(201).json({ message: "Coupon created successfully.", sucess: true, coupon: newCouponEntry });
}));
exports.applyDiscount = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { coupon } = req.query;
    const discount = yield coupon_models_1.Coupon.findOne({ code: coupon });
    if (!discount) {
        return res.status(404).json({ message: "Coupon not found.", success: false });
    }
    return res.status(200).json({ message: "Coupon applied successfully.", success: true, discount: discount.amount });
}));
exports.getAllCoupon = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const coupons = yield coupon_models_1.Coupon.find({});
    return res.status(200).json({ message: "Coupons retrieved successfully.", success: true, coupons });
}));
exports.deleteCoupon = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const coupon = yield coupon_models_1.Coupon.findByIdAndDelete(id);
    if (!coupon) {
        return res.status(404).json({ message: "Coupon not found.", success: false });
    }
    return res.status(200).json({
        message: `Coupon ${coupon === null || coupon === void 0 ? void 0 : coupon.code} deleted successfully.`, success: true
    });
}));
