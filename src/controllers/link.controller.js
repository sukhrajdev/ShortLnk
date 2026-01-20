import { prisma } from "../config/prisma.js";
import "node-cache";
import { generateShortCode } from "../utils/generateShortCode.js";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export async function createLink(req, res) {
    try {
        const {id} = req.user;
        if(!id){
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
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
                userId: id,
                originalLink,
                linkCode
            },
        });

        cache.set(linkCode, {
            originalLink: newLink.originalLink,
            userId: newLink.userId,
            createdAt: newLink.createdAt,
            updatedAt: newLink.updatedAt,
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

export async function getLink(req,res){
    try{
        const {LinkCode} = req.params;
        if(cache.has(LinkCode)){
            const cachedLink = cache.get(LinkCode);
            return res.redirect(cachedLink.originalLink);
        }
        const link = await prisma.link.findFirst({
            where: { linkCode: LinkCode },
        })
        if(!link){
            return res.status(404).json({
                success: false,
                message: "Link not found",
            })
        }
        cache.set(LinkCode, link);
        res.redirect(link.originalLink);
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}

export async function getAllLinks(req,res){
    try{
        const {id} = req.user;
        if(!id){
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const links = await prisma.link.findMany({
            where: { userId: id },
            select: {
                originalLink: true,
                linkCode: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return res.status(200).json({
            success: true,
            data: links,
            message: "Links retrieved successfully",
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}

export async function deleteLink(req,res){
    try{
        const {LinkCode} = req.params;
        const {id} = req.user;
        const link = await prisma.link.findFirst({
            where: { linkCode: LinkCode },
        })
        if(!link){
            return res.status(404).json({
                success: false,
                message: "Link not found",
            })
        }
        if(link.userId !== id){
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this link",
            })
        }
        await prisma.link.delete({
            where: { linkCode: LinkCode },
        })
        cache.del(LinkCode);
        return res.status(200).json({
            success: true,
            message: "Link deleted successfully",
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}

export async function updateLink(req,res){
    try{
        const {LinkCode} = req.params;
        const {id} = req.user;
        const { originalLink } = req.body;
        const link = await prisma.link.findUnique({
            where: { linkCode: LinkCode },
        })
        if(!link){
            return res.status(404).json({
                success: false,
                message: "Link not found",
            })
        }
        if(link.userId !== id){
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this link",
            })
        }
        const updatedLink = await prisma.link.update({
            where: { linkCode: LinkCode },
            data: { originalLink },
        })
        cache.del(LinkCode);
        cache.set(LinkCode, {
            originalLink: updatedLink.originalLink,
            userId: updatedLink.userId,
            createdAt: updatedLink.createdAt,
            updatedAt: updatedLink.updatedAt,
        });
        return res.status(200).json({
            success: true,
            data: updatedLink,
            message: "Link updated successfully",
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}
