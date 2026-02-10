import { HydratedDocument, model, Schema, Types } from "mongoose";
import { StatusEnum } from "../modules/Utilis/Enums/courses";



export interface ISection {

    name?: string,

    courseId: Types.ObjectId,

    CreatedBy?: Types.ObjectId,
    CreatedAt?: Date,

    Status: StatusEnum

}

export const SectionSchema = new Schema<ISection>({

    name: {
        type: String,
        maxLength: [100, "name must not exceed 100"],
        minLength: [5, "name must not be less than  5"],
        required: true
    },


    courseId: { type: Schema.Types.ObjectId, ref: "Course" },

    CreatedAt: Date,
    CreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

   
    Status: {
        type: String,
        enum: StatusEnum,
        required: true,
        default: StatusEnum.Active
    },



}, { timestamps: true })




export type SectionHydareatedDocument = HydratedDocument<ISection>
export const SectionModel = model<ISection>("Section", SectionSchema)