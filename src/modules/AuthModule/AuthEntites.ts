import { UserHydratedDocument } from "../../Schema/UserModel";



export interface UserResponse{
    user:UserHydratedDocument
}

export interface loginResponse{
    Credentials:{
        AcessToken:String,
        RefreshToken:String
    },
    user:UserHydratedDocument
}