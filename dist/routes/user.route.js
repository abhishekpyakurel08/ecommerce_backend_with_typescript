"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controllers_1 = require("../controllers/user.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_middleware_1 = require("../middleware/multer.middleware");
const router = express_1.default.Router();
router.route("/register").post(multer_middleware_1.singleUpload, user_controllers_1.registerUser);
router.route("/all").get(auth_middleware_1.ADMINONLY, user_controllers_1.getAllUser);
router.route("/:id").get(user_controllers_1.getUser);
router.route("/:id").delete(auth_middleware_1.ADMINONLY, user_controllers_1.deleteUser);
exports.default = router;
