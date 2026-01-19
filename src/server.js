import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/auth.routes.js";
import "dotenv/config";

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/api/auth", router)

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