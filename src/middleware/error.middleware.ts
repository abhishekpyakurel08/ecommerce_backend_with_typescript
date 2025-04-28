import { NextFunction , Request,Response} from "express";
import ErrorHandler from "../utils/utility-class";
import { ControllerType } from "../types/types";

export const errorMiddleware = (err:ErrorHandler,req:Request,res:Response,next:NextFunction) => {
    err.message ||=  "Internal Server Error",
    err.statusCode ||= 500

    return res.status(err.statusCode).json({
        message:err.message,
        status:500,
        success: false
        })
}




export const TryCatch = (func: ControllerType) => (req:Request,res:Response,next:NextFunction) => {

    return Promise.resolve(func(req,res,next)).catch(next)

    
}