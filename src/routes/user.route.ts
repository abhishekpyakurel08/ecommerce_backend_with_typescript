
import express from "express"
import { deleteUser, getAllUser, getUser, registerUser } from "../controllers/user.controllers"
import { ADMINONLY } from "../middleware/auth.middleware"
import { singleUpload } from "../middleware/multer.middleware"


const router = express.Router()

router.route("/register").post(singleUpload,registerUser)
router.route("/all").get(ADMINONLY,getAllUser)
router.route("/:id").get(getUser)
router.route("/:id").delete(ADMINONLY,deleteUser)

export default router