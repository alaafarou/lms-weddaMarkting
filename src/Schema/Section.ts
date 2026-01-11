import  { HydratedDocument, model, Schema, Types } from "mongoose";


export interface ISection {

    name?: string,

    courseId: Types.ObjectId,

    CreatedBy?: Types.ObjectId,
    CreatedAt?: Date,

    UpdatedAt?: Date,
    UpdatedBy?: Types.ObjectId,

    DeletedAt?: Date,
    DeletedBy?: Types.ObjectId,

}

export const SectionSchema = new Schema<ISection>({

    name: {
        type: String,
        maxLength: [100, "name must not exceed 100"],
        minLength: [5, "name must not be less than  5"],
        required: true
    },


    courseId: { type: Schema.Types.ObjectId, ref: "Course" },

    CreatedAt:Date,
    CreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    UpdatedAt: Date,
    UpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    DeletedAt:Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },


}, { timestamps: true })




export type SectionHydareatedDocument = HydratedDocument<ISection>
export const SectionModel = model<ISection>("Section",SectionSchema)