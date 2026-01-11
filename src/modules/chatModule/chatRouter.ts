import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { Authorization } from "../middlwares/Authentication.middleware";
import { GetchatValidation } from "./chatValidation";
import { Endpoint } from "./ChatEndpoints";
import ChatService from "./ChatService";





export const chatRouter = Router({mergeParams:true})

chatRouter.get( 
    "/",
    validation(GetchatValidation),
    Authorization({AcessRoles:Endpoint.Getchat}),
    ChatService.GetChat
)