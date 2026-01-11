import { Socket } from "socket.io";
import { UserHydratedDocument } from "../../Schema/UserModel";
import { JwtPayload } from "jsonwebtoken";


export interface IAuthSocket extends Socket {
    Credentials?:{
        User:Partial<UserHydratedDocument>,
        decoded:JwtPayload
    }
    
}