"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymnetSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.paymnetSchema = new mongoose_1.default.Schema({
    coupon: {
        type: String,
        required: [true, "Coupon is required"],
        unique: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"]
    }
}, { timestamps: true });
