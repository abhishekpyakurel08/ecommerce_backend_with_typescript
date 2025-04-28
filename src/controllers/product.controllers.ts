import { TryCatch } from "../middleware/error.middleware";
import { Product } from "../model/product.models";
import { Request } from "express";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { rm } from "fs";
import { myCache } from "../app";
import { invalidateCache } from "../DB/config";



export const newProduct = TryCatch(async(req:Request<{},{},NewProductRequestBody>,res,next) => {
    const {name,price,stock,category} = req.body
    const photo = req.file;
    if(!photo){
     return next(new ErrorHandler("Please Add Photo",400))   
    }
    if(!name || !price || !stock || !category){
rm(photo.path,() => {
    console.log("DELETED")

})

        return next(new ErrorHandler("Please fill all fields",400))
    }

    await Product.create({
        name,
        price,
        stock,
        category:category.toLowerCase(),
        photo: photo?.path
    })
    await invalidateCache({product: true,});   

    return res.status(201).json({
        success: true,
        message: "Product created successfully"

    })

})
// Revalidate on New, Update,Delete Product and new order 
export const getLatestProduct = TryCatch(async(req,res,next) => {
    let products;
    if(myCache.has("latest-products")) products = JSON.parse(myCache.get("latest-products") as string)
        else {
     products = await Product.find({}).sort({createdAt: -1}).limit(5);

    myCache.set("latest-products",JSON.stringify(products))
}


    return res.status(200).json({
        success: true,
        products
    })

})



export const getCategoriesProduct = TryCatch(async(req,res,next) => {
    let categories;
    if(myCache.has("categories")) categories = JSON.parse(myCache.get("categories") as string)
else {
    categories = await Product.distinct("category");
    myCache.set("categories",JSON.stringify(categories));
}
    return res.status(200).json({
        success: true,
        categories
        
    })

})


export const getAdminProduct = TryCatch(async(req,res,next) => {
    let products;
    if(myCache.has("all-products")) 
        products = JSON.parse(myCache.get("all-products") as string)
    else {
    products = await Product.find({});
    myCache.set("all-products",JSON.stringify(products))
}
    return res.status(200).json({
        success: true,
        products
    })
})


export const getSingleProduct = TryCatch(async(req,res,next) => {
    
    const id = req.params.id;
    let product;
    if(myCache.has(`product-${id}`))
        product = JSON.parse(myCache.get(`product-${id}`) as string)
        else {
            product = await Product.findById(id)
            myCache.set(`product-${id}`,JSON.stringify(product))
        }
    
    return res.status(200).json({
        success: true,
        product
    })
})


export const updateProduct = TryCatch(async(req,res,next) => {
    const id = req.params.id;
    const {name,price,stock,category} = req.body;
    const photo = req.file;

    const product = await Product.findById(id);
    if(!product){
      return  next(new ErrorHandler("Product not found",404))
    }
    if(photo){
        rm(product.photo!,() => {
            console.log("OLD PHOTODELETED")
        })
        product.photo = photo.path
    }
    if(name) product.name = name;
    if(price) product.price = price;
    if(stock) product.stock = stock;
    if(category) product.category = category;
    await product.save();
    await invalidateCache({product: true,productId:String(product._id)});  
    return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
        })
})

export const deleteProduct = TryCatch(async(req,res,next) => {
    const id = req.params.id
    const product = await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("Product not found",404))
        }
        rm(product.photo!,() => {
            console.log("Product Photo Deleted")
        })
        await Product.deleteOne()
        await invalidateCache({product: true,productId:String(product._id)});  
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        })

        
    })

    export const getAllProducts = TryCatch(async(req:Request<{},{},{},SearchRequestQuery>,res,next) => {
        const {search,sort,category,price} = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page -1) * limit;

        const baseQuery:BaseQuery = {
            
        }
    if(search){
        baseQuery.name ={
            $regex: search,
            $options: 'i'
        }
    }
    if(price){
        baseQuery.price = {
            $lte: Number(price)
        }
    }
    if(category) {
        baseQuery.category = category
    }
    const productsPromise =  Product.find(baseQuery)
    .sort(sort && {price: sort === "asc" ? 1 : -1})
    .skip(skip)
    .limit(limit)

    const [products,filteredOnlyProduct] = await Promise.all([
        productsPromise,
         Product.find(baseQuery),
         

    ])
      
        const totalPage = Math.ceil(filteredOnlyProduct.length / limit);


        return res.status(200).json({
            success: true,
            products,
            totalPage
        })      
    })

    