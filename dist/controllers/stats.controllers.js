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
exports.getLineCharts = exports.getBarCharts = exports.getPieCharts = exports.getDashboardStats = void 0;
const product_models_1 = require("../model/product.models");
const user_models_1 = require("../model/user.models");
const order_models_1 = require("../model/order.models");
const error_middleware_1 = require("../middleware/error.middleware");
const app_1 = require("../app");
const config_1 = require("../DB/config");
const types_1 = require("../types/types");
exports.getDashboardStats = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let stats = {};
    if (app_1.myCache.has("admin-stats"))
        stats = JSON.parse(app_1.myCache.get("admin-stats"));
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        const thiMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        };
        const thisMonthProductsPromise = product_models_1.Product.find({
            createdAt: {
                $gte: thiMonth.start,
                $lte: thiMonth.end
            }
        });
        const lastMonthProductsPromise = product_models_1.Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const thisMonthUsersPromise = user_models_1.User.find({
            createdAt: {
                $gte: thiMonth.start,
                $lte: thiMonth.end
            }
        });
        const lastMonthUsersPromise = user_models_1.User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const thisMonthOrdersPromise = order_models_1.Order.find({
            createdAt: {
                $gte: thiMonth.start,
                $lte: thiMonth.end
            }
        });
        const lastMonthOrdersPromise = order_models_1.Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const lastSixMonthOrdersPromise = order_models_1.Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        });
        const latestTransactionPromise = order_models_1.Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);
        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productCount, userCount, allOrders, lastSixMonthOrders, categories, femaleUsersCount, latestTransaction] = yield Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            product_models_1.Product.countDocuments(),
            user_models_1.User.countDocuments(),
            order_models_1.Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            product_models_1.Product.distinct("category"),
            user_models_1.User.countDocuments({ gender: "female" }),
            latestTransactionPromise
        ]);
        const thiMonthRevenue = thisMonthOrders.reduce((total, order) => total = (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total = (order.total || 0), 0);
        const changePercent = {
            revenue: (0, config_1.calculatePercentage)(thiMonthRevenue, lastMonthRevenue),
            product: (0, config_1.calculatePercentage)(thisMonthProducts.length, lastMonthProducts.length),
            user: (0, config_1.calculatePercentage)(thisMonthUsers.length, lastMonthUsers.length),
            order: (0, config_1.calculatePercentage)(thisMonthOrders.length, lastMonthOrders.length)
        };
        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);
        const count = {
            revenue,
            product: productCount,
            user: userCount,
            order: allOrders.length
        };
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = today.getMonth() - creationDate.getMonth();
            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        const categoriesCountPromise = categories.map((category) => product_models_1.Product.countDocuments({ category }));
        const categoriesCount = yield Promise.all(categoriesCountPromise);
        const categoryCount = [];
        categories.forEach((category, i) => {
            categoryCount.push({
                [category]: Math.round((categoriesCount[i] / productCount)) * 100
            });
        });
        const userRatio = {
            male: userCount - femaleUsersCount,
            female: femaleUsersCount
        };
        const modifiedLastestTransaction = latestTransaction.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }));
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue,
            },
            userRatio,
            lastestTransaction: modifiedLastestTransaction
        };
        app_1.myCache.set("admin-stats", JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        stats
    });
}));
exports.getPieCharts = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let charts = {};
    if (app_1.myCache.has("admin-pie-charts"))
        charts = JSON.parse(app_1.myCache.get("admin-pie-charts"));
    else {
        const allOrdersPromise = order_models_1.Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]);
        const [processingOrder, shippedOrder, deliveredOrder, categories, productCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers] = yield Promise.all([
            order_models_1.Order.countDocuments({ status: "Processing" }),
            order_models_1.Order.countDocuments({ status: "Shipped" }),
            order_models_1.Order.countDocuments({ status: "Delivered" }),
            product_models_1.Product.distinct("category"),
            product_models_1.Product.countDocuments(),
            product_models_1.Product.countDocuments({ stock: 0 }),
            allOrdersPromise,
            user_models_1.User.find({}).select(["dob"]),
            user_models_1.User.countDocuments({ role: "admin" }),
            user_models_1.User.countDocuments({ role: "user" })
        ]);
        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        };
        const productCategories = yield (0, types_1.getInventories)({
            categories,
            productCount
        });
        const stockAvailablity = {
            inStock: productCount - outOfStock,
            outOfStock
        };
        const totalGrossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const totalDiscount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const markingCost = Math.round(totalGrossIncome * (30 / 100));
        const netMargin = totalGrossIncome - totalDiscount - productCount - burnt - markingCost;
        const revenueDistrubution = {
            netMargin,
            discount: totalDiscount,
            productCost: productionCost,
            burnt,
            markingCost
        };
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40),
            old: allUsers.filter((i) => i.age >= 40 && i.age < 40),
        };
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        };
        charts = {
            orderFullfillment,
            productCategories,
            stockAvailablity,
            revenueDistrubution,
            usersAgeGroup,
            adminCustomer
        };
        app_1.myCache.set("admin-pie-charts", JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts
    });
}));
exports.getBarCharts = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let bars;
}));
exports.getLineCharts = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
}));
