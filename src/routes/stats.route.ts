import express from "express"
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.controllers"

const router = express.Router()

router.route("/stats").get(getDashboardStats)

router.route("/pie").get(getPieCharts)

router.route("/bar").get(getBarCharts)

router.route("/line").get(getLineCharts)

export default router