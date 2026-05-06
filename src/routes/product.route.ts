import express from "express"
// import { authenticate, adminOnly } from "../middleware/auth.middleware"
import { deleteProduct, getAdminProduct, getAllProducts, getCategoriesProduct, getLatestProduct, getSingleProduct, newProduct, updateProduct } from "../controllers/product.controllers"
import { singleUpload } from "../middleware/multer.middleware"
import { authenticate, adminOnly } from "../middleware/auth.middleware"

const router = express.Router()

router.route("/new").post(authenticate, adminOnly, singleUpload, newProduct)
router.route("/latest").get(getLatestProduct)
router.route("/categories").get(getCategoriesProduct)
router.route("/all").get(getAllProducts)

router.route("/admin-products").get(authenticate, adminOnly, getAdminProduct)
router.route("/single/:id").get(getSingleProduct)
router.route("/:id").put(authenticate, adminOnly, singleUpload, updateProduct)
router.route("/:id").delete(authenticate, adminOnly, deleteProduct)

export default router