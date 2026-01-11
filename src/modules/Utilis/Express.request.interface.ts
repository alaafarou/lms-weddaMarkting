import { JwtPayload } from "jsonwebtoken";
import {  UserHydratedDocument } from "../../Schema/UserModel";





declare module "express-serve-static-core"
{    interface Request {
        user?: UserHydratedDocument,
        decoded?: JwtPayload,
    }
}