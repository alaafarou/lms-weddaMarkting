import { JwtPayload } from "jsonwebtoken";
import { IUser, UserHydratedDocument } from "../../Schema/UserModel";
import { Connection, Model } from "mongoose";
import { IOtp } from "../../Schema/OtpModel";
import { IToken } from "../../Schema/TokenModel";
import { ICourse } from "../../Schema/Course";
import { ILecture } from "../../Schema/lecture";
import { ISection } from "../../Schema/Section";
import { IExam } from "../../Schema/Exam";
import { ISubmition } from "../../Schema/Submition";


export interface DBModels {
    User: Model<IUser>;
    Otp: Model<IOtp>;
    Token: Model<IToken>;
    Course:Model<ICourse>;
    Lecture:Model<ILecture>;
    Section:Model<ISection>;
    Exam:Model<IExam>;
    Submission:Model<ISubmition>
}

declare module "express-serve-static-core"
{
    interface Request {
        user?: UserHydratedDocument,
        decoded?: JwtPayload,
        currentDB?: Connection
        models?: DBModels
    }
}