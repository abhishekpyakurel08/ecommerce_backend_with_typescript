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
exports.ADMINONLY = void 0;
const error_middleware_1 = require("./error.middleware");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const user_models_1 = require("../model/user.models");
exports.ADMINONLY = (0, error_middleware_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (!id) {
        return next(new utility_class_1.default(" Saale login Kr phle ", 401));
    }
    const user = yield user_models_1.User.findById(id);
    if (!user) {
        return next(new utility_class_1.default(" Saale Fake Id Deta Hai", 401));
    }
    if (user.role !== " admin") {
        return next(new utility_class_1.default(" Saale Aujat Nahi Teri", 401));
    }
    next();
}));
