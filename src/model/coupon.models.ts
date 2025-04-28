import mongoose from "mongoose";


export const couponSchema = new mongoose.Schema({
code: {
    type: String,
    required: [true, "please enter ther coupon code"],
    unique: true
},
amount: {
    type: Number,
    required: [true, "Please enter the Discount Amount"]
}

})

export const Coupon = mongoose.model("Coupon",couponSchema)