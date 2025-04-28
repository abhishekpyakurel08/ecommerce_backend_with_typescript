"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
    photo: {
        type: String,
        required: [true, "Product photo is required"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
    },
    category: {
        type: String,
        required: [true, "Product category is required"],
        trim: true
    }
}, { timestamps: true });
exports.Product = mongoose_1.default.model("Product", productSchema);
