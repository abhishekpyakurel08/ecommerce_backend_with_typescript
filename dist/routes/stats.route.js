"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stats_controllers_1 = require("../controllers/stats.controllers");
const router = express_1.default.Router();
router.route("/stats").get(stats_controllers_1.getDashboardStats);
router.route("/pie").get(stats_controllers_1.getPieCharts);
router.route("/bar").get(stats_controllers_1.getBarCharts);
router.route("/line").get(stats_controllers_1.getLineCharts);
exports.default = router;
