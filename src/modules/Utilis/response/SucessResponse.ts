import type { Response, Request, NextFunction } from "express"

export const SuccesResponse = <T=any>(
    {res,message="Done",statuscode=200,data}:
    {res:Response,message?:string,statuscode?:number,data?:T})=>{
        return res.status(statuscode).json({message,data})

}