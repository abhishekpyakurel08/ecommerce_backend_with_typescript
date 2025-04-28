"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const userSchema = new mongoose_1.default.Schema({
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
        validate: validator_1.default.default.isEmail,
    },
    photo: {
        type: String,
        required: [true, "Please enter a valid photo"],
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female", " other"],
        required: [true, "Please enter a valid gender"],
    },
    dob: {
        type: Date,
        required: [true, "Please enter a valid date of birth"],
    },
    password: {
        type: String,
        required: [true, "Please enter a valid password"],
    }
}, { timestamps: true });
//// 2025 .05/02 - 2006/06/04
// const dob = new Date("August 19, 1975 23:15:30")
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});
exports.User = mongoose_1.default.model("User", userSchema);
