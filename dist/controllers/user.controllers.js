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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUser = exports.getAllUser = exports.registerUser = void 0;
const user_models_1 = require("../model/user.models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_middleware_1 = require("../middleware/error.middleware");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, _id, email, password, photo, dob, gender } = req.body;
        console.log(name, _id, email, password, photo, dob, gender);
        if (!name || !_id || !email || !password || !photo || !dob || !gender) {
            return res.status(400).json({ message: "Please fill all the fields", sucess: false });
        }
        let user = yield user_models_1.User.findById(_id);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        user = yield user_models_1.User.create({
            name,
            _id,
            email,
            password: hashedPassword,
            photo,
            dob: new Date(dob),
            gender
        });
        yield user.save();
        return res.status(201).json({ message: "User created successfully", user, success: true });
    }
    catch (error) {
        console.log(error);
    }
});
exports.registerUser = registerUser;
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_models_1.User.find({}).select("-password");
        return res.status(200).json({ users, success: true });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getAllUser = getAllUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield user_models_1.User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({ user, success: true });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUser = getUser;
exports.deleteUser = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const user = yield user_models_1.User.findById(id);
    if (!user) {
        return next(new utility_class_1.default(" User not found", 404));
    }
    yield user.deleteOne();
    return res.status(200).json({ message: "User deleted successfully", success: true });
}));
