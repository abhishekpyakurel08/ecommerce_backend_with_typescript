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
exports.getAllProducts = exports.deleteProduct = exports.updateProduct = exports.getSingleProduct = exports.getAdminProduct = exports.getCategoriesProduct = exports.getLatestProduct = exports.newProduct = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const product_models_1 = require("../model/product.models");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const fs_1 = require("fs");
const app_1 = require("../app");
const config_1 = require("../DB/config");
exports.newProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) {
        return next(new utility_class_1.default("Please Add Photo", 400));
    }
    if (!name || !price || !stock || !category) {
        (0, fs_1.rm)(photo.path, () => {
            console.log("DELETED");
        });
        return next(new utility_class_1.default("Please fill all fields", 400));
    }
    yield product_models_1.Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo === null || photo === void 0 ? void 0 : photo.path
    });
    yield (0, config_1.invalidateCache)({ product: true, });
    return res.status(201).json({
        success: true,
        message: "Product created successfully"
    });
}));
// Revalidate on New, Update,Delete Product and new order 
exports.getLatestProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let products;
    if (app_1.myCache.has("latest-products"))
        products = JSON.parse(app_1.myCache.get("latest-products"));
    else {
        products = yield product_models_1.Product.find({}).sort({ createdAt: -1 }).limit(5);
        app_1.myCache.set("latest-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products
    });
}));
exports.getCategoriesProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let categories;
    if (app_1.myCache.has("categories"))
        categories = JSON.parse(app_1.myCache.get("categories"));
    else {
        categories = yield product_models_1.Product.distinct("category");
        app_1.myCache.set("categories", JSON.stringify(categories));
    }
    return res.status(200).json({
        success: true,
        categories
    });
}));
exports.getAdminProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let products;
    if (app_1.myCache.has("all-products"))
        products = JSON.parse(app_1.myCache.get("all-products"));
    else {
        products = yield product_models_1.Product.find({});
        app_1.myCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products
    });
}));
exports.getSingleProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let product;
    if (app_1.myCache.has(`product-${id}`))
        product = JSON.parse(app_1.myCache.get(`product-${id}`));
    else {
        product = yield product_models_1.Product.findById(id);
        app_1.myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product
    });
}));
exports.updateProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = yield product_models_1.Product.findById(id);
    if (!product) {
        return next(new utility_class_1.default("Product not found", 404));
    }
    if (photo) {
        (0, fs_1.rm)(product.photo, () => {
            console.log("OLD PHOTODELETED");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    yield product.save();
    yield (0, config_1.invalidateCache)({ product: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
    });
}));
exports.deleteProduct = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const product = yield product_models_1.Product.findById(id);
    if (!product) {
        return next(new utility_class_1.default("Product not found", 404));
    }
    (0, fs_1.rm)(product.photo, () => {
        console.log("Product Photo Deleted");
    });
    yield product_models_1.Product.deleteOne();
    yield (0, config_1.invalidateCache)({ product: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });
}));
exports.getAllProducts = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: 'i'
        };
    }
    if (price) {
        baseQuery.price = {
            $lte: Number(price)
        };
    }
    if (category) {
        baseQuery.category = category;
    }
    const productsPromise = product_models_1.Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    const [products, filteredOnlyProduct] = yield Promise.all([
        productsPromise,
        product_models_1.Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(200).json({
        success: true,
        products,
        totalPage
    });
}));
