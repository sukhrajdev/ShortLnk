import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import linkRouter from "./routes/links.routes.js";
import { verifyEmail } from "./controllers/auth.controller.js";
import { getLink } from "./controllers/link.controller.js";
import "dotenv/config";

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/links", linkRouter)

// Route for retrieving a link by its code
app.get('/:LinkCode', getLink);

app.get("/verify-email", verifyEmail)
    
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to ShortLnk Backend API",
        version: "1.0.0",
        status: "running"
    })
})
console.log("DATABASE_URL =", process.env.DATABASE_URL)
app.listen(port, () => {
    console.log("API is Working Correctly!!")
})