import { prisma } from "../config/prisma.js";
import { generateShortCode } from "../utils/generateShortCode.js";

export async function createLink(req, res) {
    try {
        const {id} = req.user;
        const { originalLink } = req.body;
        if(!originalLink){
            return  res.status(400).json({
                success: false,
                message: "Original Link is required",
            });
        }
        const linkCode = generateShortCode(8);
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                _count: {
                    select: { links: true },
                }
            }
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user._count.links >= 5) {
            return  res.status(400).json({
                success: false,
                message: "Link limit reached. Upgrade your plan to create more links.",
            });
        }
        const newLink = await prisma.link.create({
            data: {
                id,
                originalLink,
                linkCode
            },
        });

        return res.status(201).json({
            success: true,
            data: newLink,
            message: "Link created successfully",
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}

