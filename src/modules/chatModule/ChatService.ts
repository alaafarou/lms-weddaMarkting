import { Types } from "mongoose";
import { ChatModel } from "../../Schema/lecture";
import { ChatRepositry } from "../Utilis/DatabasePattern/ChatRepostory";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { GetChatParamDto, MessageDto } from "./chatDto";
import type { Response, Request, NextFunction } from "express"
import { BadRequestException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { UserModel } from "../../Schema/UserModel";
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry";
import { connectedSockets } from "../gateway/gatway";




class ChatService {

    private readonly chatReposatory = new ChatRepositry(ChatModel)
    private readonly UserReopastory = new UserRepositry(UserModel)

    constructor() { }

    // restApi
    async GetChat(req: Request, res: Response, next: NextFunction) {

        const { userId } = req.params as GetChatParamDto
        const chat = await this.chatReposatory.findOne({
            filter: {
                Participants: { $all: [req.user?._id, Types.ObjectId.createFromHexString(userId)] },
                group: { $exists: false }
            },
            options: {
                populate: [{
                    path: "Participants",
                    select: "firstname lastname email"
                }]
            }
        })
        if (!chat) {
            throw new BadRequestException("failed to get chating instance")
        }

        return SuccesResponse({ res })

    }


    //IO

    async Sendmessage({ socket, io, sendto, content }: MessageDto) {

        try {

            const CreatedBy = socket.Credentials?.User._id as Types.ObjectId
            const SendTo = Types.ObjectId.createFromHexString(sendto) as Types.ObjectId

            const user = await this.UserReopastory.findOne({
                filter: {
                    _id: SendTo,
                    freezedAt: { $exists: false },
                    friends: { $in: CreatedBy }
                }
            })

            if(!user){throw new NotFoundException("invalid user")}

            const chechChat = await this.chatReposatory.findOneAndupdate({
                filter: {
                    Participants: { $all: [CreatedBy, SendTo] },
                    group: { $exists: false }
                },
                update: {
                    $addToSet: { messages: { content, CreatedBy } }
                },
            })

            if (!chechChat) {
                const [newchat] = await this.chatReposatory.create({
                    data: [{
                        Participants: [CreatedBy, SendTo],
                        messages: [{ content, CreatedBy }],
                        CreatedBy
                    }]
                }) || []

                
                if(!newchat){throw new BadRequestException("failed to generate chatInstance")}
            }

            io?.to(connectedSockets.get(CreatedBy.toString() as string) as string[])
            .emit("successMessage",{content})

        } catch (error) {
            socket.emit("err", error)
        }
    }


}


export default new ChatService()