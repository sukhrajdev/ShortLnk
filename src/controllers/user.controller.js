import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";

export async function updateUser(req,res){
    try{
        const {id} = req.params;
        console.log("User ID to update:", id);
        const {username, email} = req.body;
        if(!id){
            return res.status(400).json({
                success:false,
                message:"User ID is required",
            })
        }
        if(!username && !email){
            return res.status(400).json({
                success:false,
                message:"Atleast one field is required to update",
            })
        }
        if(!email.endsWith("@gmail.com")){
            return res.status(400).json({
                success:false,
                message:"Email is invalid",
            })
        }
        const user = await prisma.user.update({
            where:{
                id: id,
            },
            data: {
                username: username,
                email: email,
            },
            select: {
                id:true,
                username:true,
                email:true,
                links:true,
                isVerified:true,
                createdAt:true,
                updatedAt:true
            }
        })
        return res.status(200).json({
            success:true,
            message:"User updated successfully",
            data: user,
        })
    }catch (err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message
        })
    }
}

export async function deleteUser(req,res){
    try{
        const {id} = req.params;
        if(!id){
            return res.status(400).json({
                success:false,
                message:"User ID is required",
            })
        }
        await prisma.user.delete({
            where:{
                id: id
            }
        })
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message
        })
    }
}

export async function forgetPassword(req,res){
    try{
        const id = req.user.id;
        const {oldPassword,newPassword} = req.body;
        if(!id){
            return res.status(400).json({
                success:false,
                message:"User ID is required",
            })
        }
        if(!oldPassword){
            return res.status(400).json({
                success:false,
                message:"Old password is required",
            })
        }
        if(!newPassword){
            return res.status(400).json({
                success:false,
                message:"New password is required",
            })
        }
        const user = await prisma.user.findUnique({
            where:{
                id: id,
            }
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        const isMatch = await bcrypt.compare(oldPassword,user.password);
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Old password is incorrect",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword,10);
        await prisma.user.update({
            where:{
                id: id,
            },
            data:{
                password: hashedPassword,
            }
        });
        return res.status(200).json({
            success:true,
            message:"Password updated successfully",
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }
}

export async function getUser(req,res){
    try{
        const {id} = req.params;
        if(!id){
            return res.status(400).json({
                success:false,
                message:"User ID is required",
            })
        }
        const user = await prisma.user.findUnique({
            where:{
                id: id,
            },
            select: {
                id:true,
                username:true,
                email:true,
                links:true,
                isVerified:true,
                createdAt:true,
                updatedAt:true
            }
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        return res.status(200).json({
            success:true,
            message:"User fetched successfully",
            data: user,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message
        })
    }
}
