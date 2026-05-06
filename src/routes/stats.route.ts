import express from "express"
import { authenticate, adminOnly } from "../middleware/auth.middleware"
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.controllers"

const router = express.Router()

router.route("/stats").get(authenticate, adminOnly, getDashboardStats)

router.route("/pie").get(authenticate, adminOnly, getPieCharts)

router.route("/bar").get(authenticate, adminOnly, getBarCharts)

router.route("/line").get(authenticate, adminOnly, getLineCharts)

export default router