import { Product } from "../model/product.models";
import { User } from "../model/user.models";
import { Order } from "../model/order.models";
import { TryCatch } from "../middleware/error.middleware";
import { cacheService } from "../services/cache.service";
import { calculatePercentage } from "../DB/config";
import { getInventories } from "../types/types";


export const getDashboardStats = TryCatch(async(req,res,next) => {
    
    let stats: any = {};

    if (cacheService.has("admin-stats")) {
      const cached = cacheService.get<any>("admin-stats");
      if (cached) stats = cached;
    }
    else {
        const today = new Date();
        const sixMonthAgo = new Date()
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)

        const thiMonth = {
            start:  new Date(today.getFullYear(),today.getMonth(),1),
            end: today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(),today.getMonth()-1,1),
            end: new Date(today.getFullYear(),today.getMonth(),0)
        }



const thisMonthProductsPromise = Product.find({
    createdAt: {
        $gte: thiMonth.start,
        $lte: thiMonth.end
    }
})
const lastMonthProductsPromise = Product.find({
    createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end
    }
})






const thisMonthUsersPromise = User.find({
    createdAt: {
        $gte: thiMonth.start,
        $lte: thiMonth.end
    }
})
const lastMonthUsersPromise = User.find({
    createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end
    }
})


const thisMonthOrdersPromise = Order.find({
    createdAt: {
        $gte: thiMonth.start,
        $lte: thiMonth.end
    }
})
const lastMonthOrdersPromise = Order.find({
    createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end
    }
})

const lastSixMonthOrdersPromise = Order.find({
    createdAt: {
        $gte: sixMonthAgo,
        $lte: today
    }
})
const latestTransactionPromise = Order.find({}).select(["orderItems","discount","total","status"]).limit(4)


const [thisMonthProducts,thisMonthUsers,thisMonthOrders,lastMonthProducts,lastMonthUsers,lastMonthOrders,productCount,
    userCount,
    allOrders,
    lastSixMonthOrders,
    categories,
    femaleUsersCount,
    latestTransaction
] = await Promise.all([
    thisMonthProductsPromise,
    thisMonthUsersPromise,
    thisMonthOrdersPromise,
    lastMonthProductsPromise,
    lastMonthUsersPromise,
    lastMonthOrdersPromise,
    Product.countDocuments(),
    User.countDocuments(),
    Order.find({}).select("total"),
    lastSixMonthOrdersPromise,
    Product.distinct("category"),
    User.countDocuments({gender:"female"}),
    latestTransactionPromise
    
])

const thiMonthRevenue = thisMonthOrders.reduce((total,order) => total = (order.total || 0),0)
const lastMonthRevenue = lastMonthOrders.reduce((total,order) => total = (order.total || 0), 0)



const changePercent = {
    revenue: calculatePercentage(thiMonthRevenue,lastMonthRevenue),
    product:calculatePercentage(thisMonthProducts.length,lastMonthProducts.length),

    user: calculatePercentage(thisMonthUsers.length,lastMonthUsers.length),

    order: calculatePercentage(thisMonthOrders.length,lastMonthOrders.length)
}

const revenue = allOrders.reduce((total,order) => total + (order.total || 0),0)

const count = {
    revenue,
    product: productCount,
    user: userCount,
    order: allOrders.length
}
const orderMonthCounts = new Array(6).fill(0)
const orderMonthlyRevenue = new Array(6).fill(0)
lastSixMonthOrders.forEach((order) => {
   const creationDate = order.createdAt;

   const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12
   if(monthDiff < 6){
    orderMonthCounts[6-monthDiff -1] +=1
    orderMonthlyRevenue[6-monthDiff-1] += order.total


   }
})
const categoriesCountPromise =categories.map((category) => Product.countDocuments({category}))
const categoriesCount = await Promise.all(categoriesCountPromise);

const categoryCount:Record<string,number>[] = [];

categories.forEach((category,i) => {
    categoryCount.push(
        {
            [category]: Math.round((categoriesCount[i]/productCount)) * 100
        }
    )
})
const userRatio = {
    male: userCount - femaleUsersCount,
    female: femaleUsersCount
}
const modifiedLastestTransaction = latestTransaction.map((i) => ({
    _id: i._id,
    discount: i.discount,
    amount: i.total,
    quantity: i.orderItems.length,
    status: i.status
}))
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
cacheService.set("admin-stats", stats)

    }


    return res.status(200).json({
        success: true,
        stats
    })

})

export const getPieCharts = TryCatch(async(req,res,next) => {
    
    let charts: any = {};

    if (cacheService.has("admin-pie-charts")) {
      const cached = cacheService.get<any>("admin-pie-charts");
      if (cached) charts = cached;
    }
        else {
    const allOrdersPromise = Order.find({}).select(["total","discount","subtotal","tax","shippingCharges"])
    
            const [processingOrder,shippedOrder,deliveredOrder,categories,productCount,outOfStock,allOrders,allUsers,
                adminUsers,
                customerUsers

            ] = await Promise.all([
                Order.countDocuments({status: "Processing"}),
                Order.countDocuments({status: "Shipped"}),
                Order.countDocuments({status: "Delivered"}),
                Product.distinct("category"),
                Product.countDocuments(),
                Product.countDocuments({stock: 0}),
                allOrdersPromise,
                User.find({}).select(["dob"]),
                User.countDocuments({role: "admin"}),
                User.countDocuments({role: "user"})
                
                
            ])

            const orderFullfillment ={
                processing: processingOrder,
                shipped: shippedOrder,
                delivered: deliveredOrder

            }
            const productCategories = await getInventories({
                categories,
                productCount
            })

            const stockAvailablity = {
                inStock: productCount - outOfStock,
                outOfStock
            }
            const totalGrossIncome = allOrders.reduce((prev,order) => prev + (order.total || 0),0)

            const totalDiscount = allOrders.reduce((prev,order) => prev + (order.discount || 0),0)

            const productionCost = allOrders.reduce((prev,order) => prev + (order.shippingCharges || 0),0)

            const burnt = allOrders.reduce((prev,order) => prev + (order.tax || 0),0)

            const markingCost = Math.round(totalGrossIncome * (30 /100))

            const netMargin = totalGrossIncome - totalDiscount - productCount -burnt - markingCost

            const revenueDistrubution = {
                netMargin,
                discount: totalDiscount,
                productCost: productionCost,
                burnt,
                markingCost

            }
            const usersAgeGroup = {
                teen: allUsers.filter((i) => i.age < 20).length,
                adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
                old: allUsers.filter((i) => i.age >= 40).length,
            }

            const adminCustomer = {
admin: adminUsers,
customer: customerUsers

            }

            charts = {
                orderFullfillment,
                productCategories,
                stockAvailablity,
                revenueDistrubution,
                usersAgeGroup,
                adminCustomer
            }








cacheService.set("admin-pie-charts", charts)            
    }
    return res.status(200).json({
        success: true,
        charts
    })
})


export const getBarCharts = TryCatch(async(req,res,next) => {
    let bars;

    if (cacheService.has("admin-bar-charts")) bars = cacheService.get("admin-bar-charts");
    else {
      cacheService.set("admin-bar-charts", bars);
    }
        return res.status(200).json({
            success: true,
            bars
        })

})

export const getLineCharts = TryCatch(async(req,res,next) => {
    
})