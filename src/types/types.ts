import { NextFunction,Request,Response } from "express";
import { Product } from "../model/product.models";


export interface NewUserRequestBody {
    name: string;
    email: string;
    photo: string;
    password: string;
    gender: string;
    _id: string;
    dob: Date

}



export type ControllerType =(
    req:Request,
    res:Response,
    next:NextFunction) => Promise<void | Response<any, Record<string, any>>>


    export interface NewProductRequestBody {
        name: string;
        category: string;
        price: number;
        stock: number;
    }


    export type SearchRequestQuery ={
        search?:string,
        price?: string,
        category?:string,
        sort?:string,
        page?: string
    }





    export interface BaseQuery {
        name?: {
            $regex: string;
            $options: string;
        };
        price?: {
            $lte: number;
        };
        category?: string

    }


    export type InvalidateCacheProps = {
product?:boolean,
order?: boolean,
admin?: boolean,
userId? : string,
orderId?: string
productId?: string | string[]

    }


    export type orderItemsType = {
        name: string;
        photo: string;
        price: number;
        quantity: number;
        productId: string;
    }
    export type ShippingInfoType ={
        address: string;
        city: string;
        country: string;
        state: string;
        pinCode: number
    }

    export interface NewOrderRequestBody {
shippingInfo: {},
user: string;
subtotal: number;
tax: number;
shippingCharges: number;
discount: number;
total: number;
orderItems: orderItemsType[]
    }


    export interface NewCouponRequestBody {
        code: string,
        amount: number

    }

export const getInventories = async({
    categories,
    productCount,
}:{
    categories: string[];
    productCount: number
}) => {
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
    return categoryCount
}
