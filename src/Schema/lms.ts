import { HydratedDocument, model, Schema, Types } from "mongoose";


export interface ILMS {
    Name: string,
    Host:string[],
    DB_Name: string,

    CreatedBy:Types.ObjectId
    CreatedAt:Date,

    DeletedAt:Date
    DeletedBy:Types.ObjectId

    UpdatedAt:Date
    UpdatedBy:Types.ObjectId
}




const LmsSchema = new Schema<ILMS>({

    Name: {
        type: String,
        maxLength: [100, "name must not exceed 100"],
        minLength: [5,   "name must not be less than  5"],
        required: true,
        unique:true
    },

    DB_Name: {
        type: String,
        required: true,
        unique:true
    },

    Host: {
        type:[String],
        required: true,
        unique:true
    },

    CreatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    UpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    UpdatedAt: Date,

    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" }
    
}, { timestamps: true })




export const LMSModel = model<ILMS>("LMS", LmsSchema)
export type CourseHydareatedDocument = HydratedDocument<ILMS>