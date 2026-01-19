import e from "express";
import jwt from "jsonwebtoken";

export function generateRefreshToken(userId){
    try {
        const refreshToken = jwt.sign({
            id:userId
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
        return refreshToken;
    } catch (err) {
        console.log("Error occured while generating tokens ", err.message)
    }
}

export function generateAccessToken(userId){
    try{
        const accessToken = jwt.sign({
            id:userId
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
        return accessToken;
    }catch(err){
        console.log("Error occured while generating access token ",err.message)
        }
}