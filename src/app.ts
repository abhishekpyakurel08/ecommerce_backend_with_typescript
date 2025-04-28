import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { connectDB } from "./DB/config"
import userRoute from "./routes/user.route"
import productRoute from "./routes/product.route"
import orderRoute from "./routes/order.route"
import paymentRoute from "./routes/coupon.route"
import dashboardRoute from "./routes/stats.route"
import { errorMiddleware } from "./middleware/error.middleware"
import NodeCache from "node-cache"
import Stripe from "stripe"

const app = express()

dotenv.config({
    "path": "./src/.env"
})
connectDB()
const stripeKey = process.env.STRIPE_KEY
 || "";

export const stripe = new Stripe(stripeKey)

export const myCache = new NodeCache();


const port = process.env.PORT || 8000


app.use(express.json()); // This parses incoming JSON
app.use(express.urlencoded({
    extended: true
}))
 // Optional: handles form data
const corsOption = {
    origin: "http://localhost:5173",
    credentials: true
}
app.use(cors(corsOption))
app.use(cookieParser())
app.use(morgan("dev"))


// // ROutes
app.use("/api/v1/user",userRoute)
app.use("/api/v1/product",productRoute)
app.use("/api/v1/order",orderRoute)
app.use("/api/v1/payments",paymentRoute)
app.use('/api/v1/dashboard',dashboardRoute)
app.use("/uploads",express.static("uploads"));

app.listen(port,() => {
    console.log(`Server Started at PORT ${port}`)
})