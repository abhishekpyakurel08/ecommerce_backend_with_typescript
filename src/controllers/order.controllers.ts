import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.middleware";
import { Order } from "../model/order.models";
import { NewOrderRequestBody } from "../types/types";
import { invalidateCache, reduceStock } from "../DB/config";
import { cacheService } from "../services/cache.service";




export const newOrder = TryCatch(async(req:Request<{},{},NewOrderRequestBody>,res:Response,next:NextFunction) => {

    const {shippingInfo,orderItems,user,subtotal,tax,total,shippingCharges,discount} = req.body;
    if(!shippingInfo || !orderItems || !user || !subtotal || !tax || !total ){
        return res.status(400).json({message:"Please fill all the fields", success: false})
    }


 const order=  await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        total,
        discount
    })
    
    await reduceStock(orderItems)
    

    invalidateCache({product: true, order: true,admin:true,userId: user,productId:order.orderItems.map(i => String(i.productId)) })
    res.status(201).json({message:"Order placed successfully",success: true,order })

})


export const myOrder = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  const key = `my-orders-${id}`;
  let orders: any[] = [];
  if (cacheService.has(key)) {
    orders = cacheService.get<any[]>(key) || [];
  } else {
    orders = await Order.find({ user: id });
    cacheService.set(key, orders);
  }
  res.status(200).json({
    orders,
    success: true,
  });
});

export const allOrder = TryCatch(async (req, res, next) => {
  const key = 'all-orders';
  let orders: any[] = [];
  if (cacheService.has(key)) {
    orders = cacheService.get<any[]>(key) || [];
  } else {
    orders = await Order.find().populate('user', 'name');
    cacheService.set(key, orders);
  }
  res.status(200).json({
    orders,
    success: true,
    total: orders.length,
  });
});


export const getSingleOrder = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const key = `orders-${id}`;

  let order;
  if (cacheService.has(key)) {
    order = cacheService.get<any>(key);
  } else {
    order = await Order.findById(id).populate('user', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found', success: false });
    }
    cacheService.set(key, order);
  }

  return res.status(200).json({ order, success: true });
});

export const processingOrder = TryCatch(async(req,res,next) => {
    const {id} = req.params;
    const order = await Order.findById(id)
if(!order){
    return res.status(404).json({message: "Order not found",
        success: false
    })
}
switch(order.status) {
    case "Processing":
    order.status= "Shipped";
    break;
    case "Shipped":
        order.status = "Delivered";
 break;
 default:
    order.status = "Delivered";
    break  
}
await order.save()
await invalidateCache({product: false,order: true, admin: true, userId: order.user, orderId:String(order)})
return res.status(200).json({message: "Order Processing successfully", success: true});

})


export const deleteOrder = TryCatch(async(req,res,next) => {
    const {id} = req.params;
    const order = await Order.findById(id);
    if(!order){
        return res.status(404).json({message: "Order not found", success: false});
        }
    await order.deleteOne()
    await invalidateCache({product: false, order: true,admin: true,userId: order.user, orderId:String(order)})
    return res.status(200).json({message: "Order deleted successfully", success: true});
})