import { NextFunction, Request, Response, RequestHandler, ErrorRequestHandler } from "express";
import ErrorHandlerClass from "../utils/utility-class";
import { ControllerType } from "../types/types";

export const errorMiddleware: ErrorRequestHandler = (err: ErrorHandlerClass, req: Request, res: Response, next: NextFunction) => {
    err.message ||= "Internal Server Error",
        err.statusCode ||= 500

    res.status(err.statusCode).json({
        message: err.message,
        status: 500,
        success: false
    })
}




export const TryCatch = (func: ControllerType): RequestHandler => (req: Request, res: Response, next: NextFunction) => {

    Promise.resolve(func(req, res, next)).catch(next)


}