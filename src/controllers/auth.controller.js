import { prisma } from "../config/prisma.js";
import { sendVerificationEmail } from "../services/email/sendVerificationEmail.js";
import { generateToken } from "../utils/generateToken.js";
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
  
return res.status(201).json({
    success: false,
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
    if (user.length == 0) {
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
    let refreshToken,
    accessToken = generateToken(user.id);
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
      .header("Authorization", `Bearer ${accessToken}`)
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
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    return res
      .status(200)
      .clearheader("Authorization")
      .clearCookie("refreshToken", cookieOptions)
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        const newAccessToken = generateToken(user.id);
        return res.status(200).cookie("accessToken",newAccessToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
        }).json({
            success:true,
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
        const {email} = req.body;
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required",
            });
        }
        const user = await prisma.user.findUnique({
            where:{
                email,
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
        id: createdUser.id,
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
