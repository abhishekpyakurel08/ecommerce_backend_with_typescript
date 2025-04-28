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
exports.getInventories = void 0;
const product_models_1 = require("../model/product.models");
const getInventories = (_a) => __awaiter(void 0, [_a], void 0, function* ({ categories, productCount, }) {
    const categoriesCountPromise = categories.map((category) => product_models_1.Product.countDocuments({ category }));
    const categoriesCount = yield Promise.all(categoriesCountPromise);
    const categoryCount = [];
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productCount)) * 100
        });
    });
    return categoryCount;
});
exports.getInventories = getInventories;
