import { NextFunction,Response, Request } from "express"

interface IError extends Error{
    statuscode:number
}

class applicationException extends Error{
    constructor(
        public override message : string,
        public readonly statuscode:number,
        public override cause?:unknown)
    {
        super()
        this.name = this.constructor.name
        Error.captureStackTrace(this,this.constructor)
    }
}



export class BadRequestException extends applicationException{
    constructor(message:string,cause?:unknown){
        super(message,400,cause)
    }
}


export class NotFoundException extends applicationException{
    constructor(message:string,cause?:unknown){
        super(message,404,cause)
    }
}


export class ForbiddenException extends applicationException{
    constructor(message:string,cause?:unknown){
        super(message,403,cause)
    }
}

export class UnauthorizedException extends applicationException{
    constructor(message:string,cause?:unknown){
        super(message,401,cause)
    }
}

export class ConflictException extends applicationException{
    constructor(message:string,cause?:unknown){
        super(message,409,cause)
    }
}


export const GlobalError = (
    error:IError,
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    return res.status(error.statuscode || 500).json({
        stack:process.env.MOD === "dev" ? error.stack : undefined,
        err_message: error.message || "something went wrong",
        cause:error.cause,
        error

    })
}