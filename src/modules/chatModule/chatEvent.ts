import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/gatwayInterface";
import ChatService from "./ChatService";




export class ChatEvents {

    private readonly ChatService = ChatService

    constructor(){}

    async message (socket:IAuthSocket,io:Server){
        return socket.on("sendMessage",(data:{content:string , sendto:string})=> {
            this.ChatService.Sendmessage({socket,io,...data})  
        })

    }
}


