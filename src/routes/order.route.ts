
import express from "express"
import { authenticate, adminOnly } from "../middleware/auth.middleware"
import { allOrder, deleteOrder, getSingleOrder, myOrder, newOrder, processingOrder } from "../controllers/order.controllers"


const router = express.Router()


router.route("/new").post(authenticate, newOrder)
router.route("/my").get(authenticate, myOrder)
router.route("/all").get(authenticate, adminOnly, allOrder)
router.route("/single/:id").get(authenticate, getSingleOrder)
router.route("/:id").put(authenticate, adminOnly, processingOrder)
router.route("/:id").delete(authenticate, adminOnly, deleteOrder)
export default router