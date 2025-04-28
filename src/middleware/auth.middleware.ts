import jwt from "jsonwebtoken"
import { TryCatch } from "./error.middleware"
import ErrorHandler from "../utils/utility-class";
import { User } from "../model/user.models";

export const ADMINONLY = TryCatch(async(req,res,next) => {

    const {id} = req.query;
    if(!id){
        return next(new ErrorHandler(" Saale login Kr phle ",401))
    }
    const user = await User.findById(id);
    if(!user){
        return next(new ErrorHandler(" Saale Fake Id Deta Hai",401))
    }
    if(user.role !== " admin"){
        return next (new ErrorHandler(" Saale Aujat Nahi Teri",401))
    }
    next()


})