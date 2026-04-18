import express from "express"
// import { ADMINONLY } from "../middleware/auth.middleware"
import { deleteProduct, getAdminProduct, getAllProducts, getCategoriesProduct, getLatestProduct, getSingleProduct, newProduct, updateProduct } from "../controllers/product.controllers"
import { singleUpload } from "../middleware/multer.middleware"
import { ADMINONLY } from "../middleware/auth.middleware"

const router = express.Router()

router.route("/new").post(ADMINONLY,singleUpload,newProduct)
router.route("/latest").get(getLatestProduct)
router.route("/category").get(getCategoriesProduct)
router.route("/all").get(getAllProducts)

router.route("/admin-products").get(ADMINONLY,getAdminProduct)
router.route("/:id").get(getSingleProduct)
router.route("/:id").put(ADMINONLY,singleUpload,updateProduct)
router.route("/:id").delete(ADMINONLY,deleteProduct)

export default router