import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to ShortLnk Backend API",
        version: "1.0.0",
        status: "running"
    })
})
app.listen(port, () => {
    console.log("API is Working Correctly!!")
})