import mongoose from "mongoose";
import { InvalidateCacheProps, orderItemsType } from "../types/types";
import { myCache } from "../app";
import { Product } from "../model/product.models";
import { Order } from "../model/order.models";

export const connectDB = async() => {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECTION!)
        console.log(`MongoDB connected: ${connect.connection.host}`)
        
    } catch (error) {
        console.log(error)
    }
}



export const invalidateCache = async({product,order,admin,userId,productId}:InvalidateCacheProps) => {
    if(product){
        const productKeys: string[] = ["latest-products","categories","all-products",`products-${productId}`];
        if(typeof productId === "string") productKeys.push(`product-${productId}`);
        if(typeof productId ==="object"){productId.forEach((i) => productKeys.push(`product-${i}`))
            console.log("LOL")
        }
 myCache.del(productKeys)

    }
if(order){
    const ordersKey: string[] = ["all-orders",`my-orders-${userId}`]
    myCache.del(ordersKey)
    
}
if(admin){

}

}



export const reduceStock = async(orderItems: orderItemsType[]) => {
    for(let i = 0; i<orderItems.length; i++){
        const order = orderItems[i];
        console.log('Reduce stock of product: ', order.productId);
        const product = await Product.findById(order.productId)
if(!product){
    throw new Error(`Product not found: ${order.productId}`)
}

product.stock -= order.quantity;

await product.save()
// console.log(product.stock)


    }
}


export const calculatePercentage = (thisMonth:number,lastMonth:number) =>{

    if(lastMonth === 0) return thisMonth * 100
    const percent = (thisMonth / lastMonth) * 100
    return Number(percent.toFixed(0))

}

