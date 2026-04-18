import { NextFunction, Request, Response } from "express";
import { NewUserRequestBody } from "../types/types";
import { User } from "../model/user.models";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { TryCatch } from "../middleware/error.middleware";
import ErrorHandler from "../utils/utility-class";
import { config } from "../config";


export const registerUser = TryCatch(async (req: Request<{}, {}, NewUserRequestBody>, res: any, next: NextFunction) => {
    const { name, _id, email, password, photo, dob, gender } = req.body;
    console.log(name, _id, email, password, photo, dob, gender);
    if (!name || !_id || !email || !password || !photo || !dob || !gender) {
        return res.status(400).json({ message: "Please fill all the fields", sucess: false });
    }
    let user = await User.findById(_id);
    const hashedPassword = await bcrypt.hash(password, 10)
    user = await User.create({
        name,
        _id,
        email,
        password: hashedPassword,
        photo,
        dob: new Date(dob),
        gender

    })
    await user.save();
    return res.status(201).json({ message: "User created successfully", user, success: true })

})

export const loginUser = TryCatch(async (req: Request, res: any, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password", success: false });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password", success: false });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRE as jwt.SignOptions['expiresIn'] }
    );

    const userWithoutPassword = await User.findById(user._id).select("-password");

    return res.status(200).json({
        message: "Login successful",
        success: true,
        user: userWithoutPassword,
        token
    });
});

export const getAllUser = TryCatch(async (req: Request, res: any, next: NextFunction) => {
    const users = await User.find({}).select("-password");
    return res.status(200).json({ users, success: true })
})

export const getUser = TryCatch(async (req: Request, res: any, next: NextFunction) => {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found", success: false })
    }
    return res.status(200).json({ user, success: true })
})

export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler(" User not found", 404))
    }
    await user.deleteOne()
    return res.status(200).json({ message: "User deleted successfully", success: true })


})

export const getMe = TryCatch(async (req: any, res: any, next: NextFunction) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
    }
    return res.status(200).json({ user, success: true });
})

export const logoutUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "Logged out successfully", success: true });
})