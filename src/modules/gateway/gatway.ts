import { Server as httpServer } from "http"
import { Server } from "socket.io";
import type { IAuthSocket } from "./gatwayInterface";
import { Decoded, TokenEnum } from "../Utilis/Security/security";
import { BadRequestException } from "../Utilis/response/ErrorResponse";
import {  ChatGateway } from "../chatModule/Chatgatway";

export const connectedSockets = new Map<string, string[]>()
let io:Server | undefined = undefined
export const Io_init = (httpServer: httpServer) => {


    // intializze connection 
    io = new Server(httpServer, {
        cors: {
            origin: "*"
        }
    })


    // io middleware 

    io.use(async (socket: IAuthSocket, next) => {
        try {
            const { decoded, User } = await Decoded({
                Authorization: socket.handshake?.auth.Authorization || " ",
                TokenType: TokenEnum.AcessToken
            })
            const userTapes = connectedSockets.get(User._id.toString()) || []
            userTapes.push(socket.id)
            connectedSockets.set(User._id.toString(), userTapes)
            socket.Credentials = {
                User,
                decoded
            }
            next()
        } catch (error: any) {

            next(new BadRequestException("couldnt auhtorized the tap", {
                key: "Io_init/middleware",
                issues: [{ meassage: error, path: "socket middleware" }]
            }))
        }
    })

    async function Disconnect(socket: IAuthSocket) {

        socket.on("disconnect", () => {
            const UserId = socket.Credentials?.User._id?.toString() as string
            const current_tape = socket.id

            const currentUseTapes = connectedSockets.get(UserId)

            const remainingTapes = currentUseTapes?.filter((tape: string) => {
                if (tape !== current_tape) {
                    return tape
                }
            })
            if (remainingTapes?.length) {
                connectedSockets.set(UserId, remainingTapes)
            }
            else {
                connectedSockets.delete(UserId)
                GetIo().emit("offline_USer", UserId)
            }

            console.log("current is offline",)
        })

    }

    // on connection
    const chatGateway: ChatGateway = new ChatGateway()
    io.on('connection', (socket: IAuthSocket) => {
        chatGateway.register(socket , GetIo())
        Disconnect(socket)
    });


}


const GetIo = () => {
    if (!io) {
        throw new BadRequestException("failed to socket io server")
    }
    return io
}






