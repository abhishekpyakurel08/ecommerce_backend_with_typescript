import { InvalidateCacheProps, orderItemsType } from "../types/types";
import { cacheService } from "../services/cache.service";
import { Product } from "../model/product.models";
import { Order } from "../model/order.models";
import { logger } from "../utils/logger";

// NOTE: Use connectDB from services/db.service.ts instead
// This function is kept for backward compatibility only
export const connectDB = async () => {
  logger.warn('Deprecated: Use services/db.service.ts connectDB instead');
};



export const invalidateCache = async ({ product, order, admin, userId, productId }: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      'latest-products',
      'categories',
      'all-products',
    ];
    if (typeof productId === 'string') productKeys.push(`product-${productId}`);
    if (typeof productId === 'object') {
      productId.forEach((i) => productKeys.push(`product-${i}`));
    }
    cacheService.del(productKeys);
  }

  if (order) {
    const ordersKey: string[] = ['all-orders', `my-orders-${userId}`];
    cacheService.del(ordersKey);
  }

  if (admin) {
    // Clear admin-related caches
    cacheService.del(['admin-stats', 'admin-pie-charts', 'admin-bar-charts', 'admin-line-charts']);
  }
};



export const reduceStock = async (orderItems: orderItemsType[]) => {
  for (const order of orderItems) {
    logger.debug('Reducing stock for product', { productId: order.productId, quantity: order.quantity });
    const product = await Product.findById(order.productId);

    if (!product) {
      throw new Error(`Product not found: ${order.productId}`);
    }

    if (product.stock < order.quantity) {
      throw new Error(`Insufficient stock for product: ${order.productId}`);
    }

    product.stock -= order.quantity;
    await product.save();
  }
};


export const calculatePercentage = (thisMonth: number, lastMonth: number): number => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return Number(percent.toFixed(1));
};

