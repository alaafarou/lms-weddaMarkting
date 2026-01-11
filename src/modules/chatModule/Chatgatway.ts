import { Server } from "socket.io"
import { ChatEvents } from "./chatEvent"
import { IAuthSocket } from "../gateway/gatwayInterface"

export class ChatGateway{

    private readonly chatEvents:ChatEvents =  new ChatEvents()

    constructor(){}

    register = (socket:IAuthSocket,io:Server) =>{
        this.chatEvents.message(socket,io)
    }

}