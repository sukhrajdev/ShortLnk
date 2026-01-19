import { prisma } from "../config/prisma.js";
import { sendVerificationEmail } from "../services/email/sendVerificationEmail.js";
import { generateRefreshToken,generateAccessToken } from "../utils/generateToken.js";
import { sendWelcomeEmail } from "../services/email/sendWelcomeEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Required fields are not provide.",
            });
        }
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "username Length minimum 3.",
            });
        }
        if (!email.endsWith("@gmail.com")) {
            return res.status(400).json({
                success: false,
                message: "Email is invaild",
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "password is too Weak.",
            });
        }
        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });
        if (user) {
      return res.status(409).json({
          success: false,
        message: "User is already register.",
    });
    }
    const salt = await bcrypt.genSalt(12);
    const hashed_password = await bcrypt.hash(password, salt);
    const createdUser = await prisma.user.create({
    data: {
        username,
        email,
        password: hashed_password,
    },
    select: {
        username:true,
        email:true,
        isVerified: true,
        id:true,
    },
    });
    const authToken = jwt.sign(
    {
        id: createdUser.id,
    },
    process.env.AUTH_TOKEN_SECRET,
    { expiresIn: process.env.AUTH_TOKEN_EXPIRY }
    );
// Send verification email
    await sendVerificationEmail(createdUser.email, authToken, createdUser.username);
    await sendWelcomeEmail(createdUser.email, createdUser.username);

    return res.status(201).json({
    success: true,
    message: "User created Successful Please verify your email.",
    data: createdUser,
    });
} catch (err) {
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
    });
}
}

export async function loginUser(req, res) {
    try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
          success: false,
          message: "Required fields are not provide.",
        });
    }
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            username: true,
            password: true,
            email: true,
            links: true,
            isVerified: true
        },
    });
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not in database.",
        });
    }
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
        return res.status(400).json({
            success: false,
            message: "Invaild credentials",
        });
    }
    if (!user.isVerified) {
        return res.status(400).json({
            success: false,
            message: "User is not verified.Please! Checkout your email",
        });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshToken,
        },
    });
    const isProd = process.env.NODE_ENV === "production";
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      })
      .json({
        success: true,
        message: "Login Successful",
        accessToken,
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            links: user.links,
            isVerified: user.isVerified,
        }
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: err.message,
    });
  }
}

export async function logoutUser(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    // 1. If no refresh token, user is already logged out
    if (!refreshToken) {
      return res.status(204).send();
    }

    // 2. Remove refresh token from DB
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    // 3. Clear cookie
    return res
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}


export async function refreshToken(req,res){
    try{
        const existingRefreshToken = req.cookies.refreshToken;
        if(!existingRefreshToken){
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            });
        }
        const user = await prisma.user.findFirst({
            where:{
                refreshToken:existingRefreshToken,
            },
        });
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            });
        }
        const newAccessToken = generateAccessToken(user.id);
        return res.status(200).json({
            success:true,
            accessToken: newAccessToken,
            message:"Access token refreshed successfully",
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        })
    }
}

export async function resendVerificationEmail(req,res){
    try{
        const {id} = req.user.id;
        const user = await prisma.user.findFirst({
            where:{
                id: id
            },
        });
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }
        if(user.isVerified){
            return res.status(400).json({
                success:false,
                message:"User is already verified",
            });
        }
        const authToken = jwt.sign(
    {
        id: user.id,
    },
    process.env.AUTH_TOKEN_SECRET,
    { expiresIn: process.env.AUTH_TOKEN_EXPIRY }
);
// Send verification email
await sendVerificationEmail(user.email, authToken, user.username);
  
        return res.status(200).json({
            success:true,
            message:"Verification email sent successfully",
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        })
    }
}

export async function verifyEmail(req,res){
    try{
        const {token} = req.query;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"Link is invalid or expired",
            })
        }
        const decoded = jwt.verify(token,process.env.AUTH_TOKEN_SECRET);
        const {id} = decoded;
        const user = await prisma.user.findFirst({
            where:{
                id: id
            },
        });
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }
        if(user.isVerified){
            return res.status(400).json({
                success:false,
                message:"User is already verified",
            });
        }
        await prisma.user.update({
            where:{
                id:user.id,
            },
            data:{
                isVerified:true,
            },
        });
        return res.status(200).json({
            success:true,
            message:"Email verified successfully",
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        })
    }
}