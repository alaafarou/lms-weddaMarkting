import  { HydratedDocument, model, Schema, Types } from "mongoose";
import { IUser, UserHydratedDocument } from "./UserModel";


export interface IEnrollment {

    courseId?: Types.ObjectId,
    UserId:Types.ObjectId | IUser,
    CreatedAt?: Date,
    LectureId?:Types.ObjectId,

    UpdatedAt?: Date,
    UpdatedBy?: Types.ObjectId,

    DeletedAt?: Date,
    DeletedBy?: Types.ObjectId,

}

export const EnrollmentSchema = new Schema<IEnrollment>({

    UserId: { type: Schema.Types.ObjectId, ref: "User" , required:true},
    
    LectureId: { type: Schema.Types.ObjectId, ref: "Lecture" },
    
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },

    CreatedAt:Date,

    UpdatedAt: Date,
    UpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    DeletedAt:Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },


}, { timestamps: true })



export type EnrollHydratedDoc = HydratedDocument<IEnrollment>
export const EnrollmentModel = model<IEnrollment>("Enrollment",EnrollmentSchema)