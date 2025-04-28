"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCache = exports.stripe = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./DB/config");
const user_route_1 = __importDefault(require("./routes/user.route"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const coupon_route_1 = __importDefault(require("./routes/coupon.route"));
const stats_route_1 = __importDefault(require("./routes/stats.route"));
const node_cache_1 = __importDefault(require("node-cache"));
const stripe_1 = __importDefault(require("stripe"));
const app = (0, express_1.default)();
dotenv_1.default.config({
    "path": "./src/.env"
});
(0, config_1.connectDB)();
const stripeKey = process.env.STRIPE_KEY
    || "";
exports.stripe = new stripe_1.default(stripeKey);
exports.myCache = new node_cache_1.default();
const port = process.env.PORT || 8000;
app.use(express_1.default.json()); // This parses incoming JSON
app.use(express_1.default.urlencoded({
    extended: true
}));
// Optional: handles form data
const corsOption = {
    origin: "http://localhost:5173",
    credentials: true
};
app.use((0, cors_1.default)(corsOption));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
// // ROutes
app.use("/api/v1/user", user_route_1.default);
app.use("/api/v1/product", product_route_1.default);
app.use("/api/v1/order", order_route_1.default);
app.use("/api/v1/payments", coupon_route_1.default);
app.use('/api/v1/dashboard', stats_route_1.default);
app.use("/uploads", express_1.default.static("uploads"));
app.listen(port, () => {
    console.log(`Server Started at PORT ${port}`);
});
