import jwt from "jsonwebtoken";

export function VerifyJwt(req,res,next){
    try{
        const accessToken = req.headers["authorization"];
        if(!accessToken){
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            });
        }
        const token = accessToken.split(" ")[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
            if(err){
                return res.status(403).json({
                    success:false,
                    message:"Forbidden",
                });
            }
            req.user = decoded;
            next();
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message,
        });
    }
}