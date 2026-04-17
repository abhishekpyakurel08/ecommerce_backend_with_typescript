
import mongoose, { Schema } from "mongoose";
import validator from"validator"


interface IUSER extends Document {
    _id: string;
    name: string;
    email: string;
    photo: string;
    password: string;
    role: "admin" | "user";
    gender: "male" | "female" | "other";
    age: number; /// Virtual Attribute
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        // required: [true, "Please enter a valid id"],ss
    },
    name: {
        type: String,
        required: [true, "Please enter a valid name"],

    },
    email: {
        type: String,
        required: [true, "Please enter a valid email"],
        unique: true,
        validate: validator.default.isEmail,

    },
    photo: {
        type: String,
        required: [true, "Please enter a valid photo"],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Please enter a valid gender'],
    },
    dob:{
        type: Date,
        required: [true, "Please enter a valid date of birth"],
    },
    password: {
        type: String,
        required: [true, "Please enter a valid password"],
        
    }


},{timestamps: true})

//// 2025 .05/02 - 2006/06/04
// const dob = new Date("August 19, 1975 23:15:30")


userSchema.virtual("age").get(function (){
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if(today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() &&  today.getDate() < dob.getDate())){
        age--;

    }
    return age

})

export const User = mongoose.model<IUSER>("User",userSchema)