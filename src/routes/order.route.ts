
import express from "express"
import { ADMINONLY } from "../middleware/auth.middleware"
import { allOrder, deleteOrder, getSingleOrder, myOrder, newOrder, processingOrder } from "../controllers/order.controllers"


const router = express.Router()


router.route("/new").post(newOrder)
router.route("/my").get(myOrder)
router.route("/all").get(ADMINONLY,allOrder)
router.route("/:id").get(getSingleOrder)
router.route("/:id").put(ADMINONLY,processingOrder)
router.route("/:id").delete(ADMINONLY, deleteOrder)
export default router