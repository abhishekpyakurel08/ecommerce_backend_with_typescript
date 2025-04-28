import { NextFunction,Request,Response } from "express";
import { NewUserRequestBody } from "../types/types";
import { User } from "../model/user.models";
import bcrypt from "bcrypt"
import { TryCatch } from "../middleware/error.middleware";
import ErrorHandler from "../utils/utility-class";


export const registerUser = async(req:Request<{},{},NewUserRequestBody>,res:any,next:NextFunction) => {
    try {
        const {name,_id,email,password,photo,dob,gender} = req.body;
        console.log(name ,_id,email,password,photo,dob,gender);
        if(!name || !_id || !email || !password || !photo || !dob || !gender){
            return res.status(400).json({message:"Please fill all the fields",sucess: false});
        }
        let user = await User.findById(_id);
        const hashedPassword = await bcrypt.hash(password,10)
         user  = await User.create({
            name,
            _id,
            email,
            password:hashedPassword,
            photo,
            dob:new Date(dob),
            gender

        })
        await user.save();
        return res.status(201).json({message:"User created successfully",user,success: true})
        
    } catch (error) {
        console.log(error)
    }
}

export const getAllUser = async(req:Request,res:any) => {
    try {
        const users = await User.find({}).select("-password");
        return res.status(200).json({users,success: true})
        
    } catch (error) {
        console.log(error)
    }
}

export const getUser = async(req:Request,res:any) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found",success: false})
        }
        return res.status(200).json({user,success: true})

        

    } catch (error) {
        console.log(error)
    }
}

export const deleteUser = TryCatch(async(req,res,next) => {
    const id = req.params.id;

    const user = await User.findById(id);
    if(!user){
        return next(new ErrorHandler(" User not found",404))
    }
    await user.deleteOne()
    return res.status(200).json({message:"User deleted successfully",success: true})


})