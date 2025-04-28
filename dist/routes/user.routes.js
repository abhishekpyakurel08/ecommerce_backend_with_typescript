"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controllers_1 = require("../controllers/user.controllers");
const router = express_1.default.Router();
router.route("/register").post(user_controllers_1.registerUser);
// router.route("/login").post(loginUser)
// router.route("/all").get(getAllUsers)
// router.route("/:id").get(getUser)
exports.default = router;
