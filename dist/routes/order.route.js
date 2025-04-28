"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_controllers_1 = require("../controllers/order.controllers");
const router = express_1.default.Router();
router.route("/new").post(order_controllers_1.newOrder);
router.route("/my").get(order_controllers_1.myOrder);
router.route("/all").get(auth_middleware_1.ADMINONLY, order_controllers_1.allOrder);
router.route("/:id").get(order_controllers_1.getSingleOrder);
router.route("/:id").put(auth_middleware_1.ADMINONLY, order_controllers_1.processingOrder);
router.route("/:id").delete(auth_middleware_1.ADMINONLY, order_controllers_1.deleteOrder);
exports.default = router;
