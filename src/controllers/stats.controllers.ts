import { Product } from "../model/product.models";
import { User } from "../model/user.models";
import { Order } from "../model/order.models";
import { TryCatch } from "../middleware/error.middleware";
import { cacheService } from "../services/cache.service";
import { calculatePercentage } from "../DB/config";
import { getInventories } from "../types/types";

export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats: any = {};

    if (cacheService.has("admin-stats")) {
        stats = cacheService.get<any>("admin-stats");
    } else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0),
        };

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            productCount,
            userCount,
            allOrders,
            lastSixMonthOrders,
        ] = await Promise.all([
            Product.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            User.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            Order.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            Product.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            User.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            Order.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            Order.find({ createdAt: { $gte: sixMonthAgo, $lte: today } }),
        ]);

        const thisMonthRevenue = thisMonthOrders.reduce((acc, order) => acc + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((acc, order) => acc + (order.total || 0), 0);

        const totalRevenue = allOrders.reduce((acc, order) => acc + (order.total || 0), 0);

        stats = {
            totalRevenue,
            totalOrders: allOrders.length,
            totalProducts: productCount,
            totalUsers: userCount,
            revenueChange: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            ordersChange: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
            productsChange: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            usersChange: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
        };

        cacheService.set("admin-stats", stats);
    }

    return res.status(200).json({
        success: true,
        ...stats,
    });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts: any = {};

    if (cacheService.has("admin-pie-charts")) {
        charts = cacheService.get<any>("admin-pie-charts");
    } else {
        const [processing, shipped, delivered, cancelled] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Order.countDocuments({ status: "Cancelled" }),
        ]);

        charts = {
            labels: ["Processing", "Shipped", "Delivered", "Cancelled"],
            data: [processing, shipped, delivered, cancelled],
        };

        cacheService.set("admin-pie-charts", charts);
    }

    return res.status(200).json({
        success: true,
        ...charts,
    });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
    let charts: any = {};

    if (cacheService.has("admin-bar-charts")) {
        charts = cacheService.get<any>("admin-bar-charts");
    } else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const [products, users, orders] = await Promise.all([
            Product.find({ createdAt: { $gte: sixMonthAgo, $lte: today } }).select("createdAt"),
            User.find({ createdAt: { $gte: sixMonthAgo, $lte: today } }).select("createdAt"),
            Order.find({ createdAt: { $gte: sixMonthAgo, $lte: today } }).select("createdAt"),
        ]);

        const productCounts = new Array(6).fill(0);
        const userCounts = new Array(6).fill(0);
        const orderCounts = new Array(6).fill(0);

        [products, users, orders].forEach((list, i) => {
            list.forEach((item) => {
                const creationDate = (item as any).createdAt;
                const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
                if (monthDiff < 6) {
                    if (i === 0) productCounts[5 - monthDiff]++;
                    if (i === 1) userCounts[5 - monthDiff]++;
                    if (i === 2) orderCounts[5 - monthDiff]++;
                }
            });
        });

        const labels = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }

        charts = {
            labels,
            products: productCounts,
            users: userCounts,
            orders: orderCounts,
        };

        cacheService.set("admin-bar-charts", charts);
    }

    return res.status(200).json({
        success: true,
        ...charts,
    });
});

export const getLineCharts = TryCatch(async (req, res, next) => {
    let charts: any = {};

    if (cacheService.has("admin-line-charts")) {
        charts = cacheService.get<any>("admin-line-charts");
    } else {
        const today = new Date();
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

        const orders = await Order.find({ createdAt: { $gte: twelveMonthAgo, $lte: today } }).select(["createdAt", "total"]);

        const revenueData = new Array(12).fill(0);

        orders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
            if (monthDiff < 12) {
                revenueData[11 - monthDiff] += order.total || 0;
            }
        });

        const labels = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }

        charts = {
            labels,
            data: revenueData,
        };

        cacheService.set("admin-line-charts", charts);
    }

    return res.status(200).json({
        success: true,
        ...charts,
    });
});