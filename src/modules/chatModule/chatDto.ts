import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/gatwayInterface";
import z from "zod";
import { GetchatValidation } from "./chatValidation";



export interface IMainDto{
    socket:IAuthSocket,
    io?:Server,
    callback?:any
    
}

export interface MessageDto extends IMainDto{
    content:string,
    sendto:string
}

export type GetChatParamDto = z.infer<typeof GetchatValidation.params>