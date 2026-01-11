import { BadRequestException, UnauthorizedException } from "../Utilis/response/ErrorResponse";
import { Decoded, TokenEnum } from "../Utilis/Security/security";
import type { NextFunction, Request,Response } from "express";
import { roleEnum } from "../../Schema/UserModel";


export const Authorization =  ({
     AcessRoles=[],
     TokenType = TokenEnum.AcessToken 
    }:{
     AcessRoles:roleEnum[],
     TokenType?:TokenEnum
    })=>{

    return async (req:Request,res:Response,next:NextFunction)=>{

        if(!req.headers.authorization){
            throw new BadRequestException("validation error",{
                key:"headers",
                issues:[{path:"authorization" , message:"missing authorization header"}]
            })
        }

        const {decoded,User} = await Decoded({
            Authorization:req.headers.authorization,
            TokenType,
        })

        if(!AcessRoles.includes(User.role))
        {
            throw new UnauthorizedException("this is not authorized account")
        }

        req.user=User,
        req.decoded=decoded
        next();
    }
}