import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pinCode: {
            type: Number,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        }
    },
    user: {
        type: String,
        ref: "User",
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    shippingCharges: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "cancelled"],
        default: "Processing"
    },
    // Payment tracking fields for production-ready Stripe
    paymentInfo: {
        id: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "succeeded", "failed", "cancelled", "refunded"],
            default: "pending"
        },
        method: {
            type: String,
            default: "card"
        },
        paidAt: {
            type: Date
        }
    },
    orderItems: [
        {
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product"
            }
        }
    ]
}, { timestamps: true })


export const Order = mongoose.model("Order",orderSchema)