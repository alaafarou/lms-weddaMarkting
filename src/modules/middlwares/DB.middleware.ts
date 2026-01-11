import { NextFunction, Request, Response } from "express";
import { IUser, userSchema } from "../../Schema/UserModel";
import { LMSModel } from "../../Schema/lms";
import { Connection, connection } from "mongoose";
import { IOtp, OtpSchema } from "../../Schema/OtpModel";
import { BadRequestException } from "../Utilis/response/ErrorResponse";
import { LmsRepositry } from "../Utilis/DatabasePattern/LmsReposatory";
import { IToken, TokenSchema } from "../../Schema/TokenModel";
import { CourseSchema, ICourse } from "../../Schema/Course";
import { ILecture, LectureSchema } from "../../Schema/lecture";
import { ISection, SectionSchema } from "../../Schema/Section";
import { ExamSchema, IExam } from "../../Schema/Exam";
import { ISubmition, SubmissionSchema } from "../../Schema/Submition";





const TenantDB_name: Record<string, string> = {};

const GetDBModels = (req: Request, DB: Connection) => {
    req.currentDB = DB
    req.models = {
        User: DB.model<IUser>("User", userSchema),
        Otp: DB.model<IOtp>("Otp", OtpSchema),
        Token: DB.model<IToken>("Token", TokenSchema),
        Course:DB.model<ICourse>("Course", CourseSchema),
        Lecture:DB.model<ILecture>("Lecture", LectureSchema),
        Section:DB.model<ISection>("Section",SectionSchema),
        Exam:DB.model<IExam>("Exam",ExamSchema),
        Submission:DB.model<ISubmition>("Submission",SubmissionSchema)
    }
}



export const DBSwitch = async (req: Request, response: Response, next: NextFunction) => {
    let DB: Connection
    const Host = req.headers.host 
    if (Host && Host !== process.env.MAINHOST) {
        console.log(Host)
        if (TenantDB_name[Host]) {
            DB = await connection.useDb(TenantDB_name[Host], { useCache: true })
            console.log(`switching to DB ${TenantDB_name[Host]}`)
            GetDBModels(req, DB)
        }
        else {
            const TenantModel = new LmsRepositry(LMSModel)
            const Tenant = await TenantModel.findOne({
                filter: {
                    Host
                }
            })
            if (!Tenant) {
                throw new BadRequestException("this frontEnd is not created")
            }
            Tenant.Host.forEach(host=>{
                TenantDB_name[host]=Tenant.DB_Name
            })
            DB = await connection.useDb(Tenant.DB_Name, { useCache: true })
            GetDBModels(req, DB)
            console.log(`switching to DB ${Tenant.DB_Name}`)
        }
    }
    next()
}




