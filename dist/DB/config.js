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
exports.calculatePercentage = exports.reduceStock = exports.invalidateCache = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../app");
const product_models_1 = require("../model/product.models");
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connect = yield mongoose_1.default.connect(process.env.DB_CONNECTION);
        console.log(`MongoDB connected: ${connect.connection.host}`);
    }
    catch (error) {
        console.log(error);
    }
});
exports.connectDB = connectDB;
const invalidateCache = (_a) => __awaiter(void 0, [_a], void 0, function* ({ product, order, admin, userId, productId }) {
    if (product) {
        const productKeys = ["latest-products", "categories", "all-products", `products-${productId}`];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object") {
            productId.forEach((i) => productKeys.push(`product-${i}`));
            console.log("LOL");
        }
        app_1.myCache.del(productKeys);
    }
    if (order) {
        const ordersKey = ["all-orders", `my-orders-${userId}`];
        app_1.myCache.del(ordersKey);
    }
    if (admin) {
    }
});
exports.invalidateCache = invalidateCache;
const reduceStock = (orderItems) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        console.log('Reduce stock of product: ', order.productId);
        const product = yield product_models_1.Product.findById(order.productId);
        if (!product) {
            throw new Error(`Product not found: ${order.productId}`);
        }
        product.stock -= order.quantity;
        yield product.save();
        // console.log(product.stock)
    }
});
exports.reduceStock = reduceStock;
const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
exports.calculatePercentage = calculatePercentage;
