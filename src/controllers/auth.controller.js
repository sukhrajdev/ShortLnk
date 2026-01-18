import { prisma } from "../config/prisma";
import { generateToken } from "../utils/generateToken.js";
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
        const user = await prisma.user.findUnique({
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
const hashed_password = await bcrypt.hash(password);
const createdUser = await prisma.user.create({
    data: {
        username,
        email,
        password: hashed_password,
    },
    select: {
        id,
        username,
        email,
        links,
        isVerified,
    },
});
const authToken = jwt.sign(
    {
        id: createdUser.id,
    },
    process.env.AUTH_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
);

await prisma.user.findUnique({
    where: {
        email,
    },
    data: {
        authToken,
    },
});
return res.status(201).json({
    success: false,
    message: "User created Successful",
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
            username,
            email,
            links,
            isVerified,
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
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
      })
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
      .clearCookie("accessToken", cookieOptions)
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

