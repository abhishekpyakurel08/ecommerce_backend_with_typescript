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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.processingOrder = exports.getSingleOrder = exports.allOrder = exports.myOrder = exports.newOrder = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const order_models_1 = require("../model/order.models");
const config_1 = require("../DB/config");
const app_1 = require("../app");
exports.newOrder = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { shippingInfo, orderItems, user, subtotal, tax, total, shippingCharges, discount } = req.body;
    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) {
        return res.status(400).json({ message: "Please fill all the fields", success: false });
    }
    const order = yield order_models_1.Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        total,
        discount
    });
    yield (0, config_1.reduceStock)(orderItems);
    (0, config_1.invalidateCache)({ product: true, order: true, admin: true, userId: user, productId: order.orderItems.map(i => String(i.productId)) });
    res.status(201).json({ message: "Order placed successfully", success: true, order });
}));
exports.myOrder = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query; /// userId
    const key = `my-orders-${id}`;
    let orders = [];
    if (app_1.myCache.has(key))
        orders = JSON.parse(app_1.myCache.get(key));
    else {
        orders = yield order_models_1.Order.find({ user: id });
        app_1.myCache.set(key, JSON.stringify(orders));
    }
    res.status(200).json({ orders,
        success: true
    });
}));
exports.allOrder = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `all-orders`;
    let orders = [];
    if (app_1.myCache.has(key))
        orders = JSON.parse(app_1.myCache.get(key));
    else {
        orders = yield order_models_1.Order.find().populate("user", "name");
        app_1.myCache.set(key, JSON.stringify(orders));
    }
    res.status(200).json({ orders,
        success: true,
        total: orders.length
    });
}));
exports.getSingleOrder = (0, error_middleware_1.TryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const key = `orders-${id}`;
    let order;
    if (app_1.myCache.has(key))
        order = JSON.parse(app_1.myCache.get(key));
    else {
        order = yield order_models_1.Order.findById(id).populate("user", "name");
        if (!order) {
            return res.status(404).json({ message: "Order not found", success: false });
        }
        app_1.myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({ order, success: true });
}));
exports.processingOrder = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const order = yield order_models_1.Order.findById(id);
    if (!order) {
        return res.status(404).json({ message: "Order not found",
            success: false
        });
    }
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    yield order.save();
    yield (0, config_1.invalidateCache)({ product: false, order: true, admin: true, userId: order.user, orderId: String(order) });
    return res.status(200).json({ message: "Order Processing successfully", success: true });
}));
exports.deleteOrder = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const order = yield order_models_1.Order.findById(id);
    if (!order) {
        return res.status(404).json({ message: "Order not found", success: false });
    }
    yield order.deleteOne();
    yield (0, config_1.invalidateCache)({ product: false, order: true, admin: true, userId: order.user, orderId: String(order) });
    return res.status(200).json({ message: "Order deleted successfully", success: true });
}));
