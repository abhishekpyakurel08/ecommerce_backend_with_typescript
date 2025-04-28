"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { ADMINONLY } from "../middleware/auth.middleware"
const product_controllers_1 = require("../controllers/product.controllers");
const multer_middleware_1 = require("../middleware/multer.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.route("/new").post(auth_middleware_1.ADMINONLY, multer_middleware_1.singleUpload, product_controllers_1.newProduct);
router.route("/latest").get(product_controllers_1.getLatestProduct);
router.route("/category").get(product_controllers_1.getCategoriesProduct);
router.route("/all").get(product_controllers_1.getAllProducts);
router.route("/admin-products").get(auth_middleware_1.ADMINONLY, product_controllers_1.getAdminProduct);
router.route("/:id").get(product_controllers_1.getSingleProduct);
router.route("/:id").put(auth_middleware_1.ADMINONLY, multer_middleware_1.singleUpload, product_controllers_1.updateProduct);
router.route("/:id").delete(auth_middleware_1.ADMINONLY, product_controllers_1.deleteProduct);
exports.default = router;
