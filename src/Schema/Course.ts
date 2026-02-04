import { HydratedDocument, model, Schema, Types } from "mongoose";
import { GradeLevelEnum, SemesterEnum, SubjectsEnum } from "../modules/Utilis/Enums/courses";

export  enum StatusEnum{
    Active="Active",
    InActive="InActive"
}


export interface ICourse {

    name: string,

    description?: string

    price: Number,

    GradeLevel: GradeLevelEnum,
    Semester: SemesterEnum,
    subject: SubjectsEnum
    
    image?: string,

    CreatedBy: Types.ObjectId,

    UpdatedBy: Types.ObjectId,

    DeletedAt: Date,
    Status:StatusEnum,
    DeletedBy: Types.ObjectId

    RestoredAt: Date,
    RestoredBy: Types.ObjectId,


}

const CourseSchema = new Schema<ICourse>({

    name: {
        type: String,
        maxLength: [100, "name must not exceed 100"],
        minLength: [5, "name must not be less than  5"],
        required: true,
        unique: true
    },

    description: {
        type: String,
        maxLength: [5000, "description must not exceed 100"],
        minLength: [5, "description must not be less than  5"],
    },

    price: {
        type: Number,
        min: [0, "the mininum price is 0 cant be negative number"],
        required: true
    },

    image: {
        type: String,
    },

    GradeLevel: {
        type: String,
        enum: GradeLevelEnum,
        required: true
    },

    Semester: {
        type: String,
        enum: SemesterEnum,
      
    },

    subject: {
        type: String,
        enum: SubjectsEnum,
   
    },

    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    DeletedAt: Date,
    Status:{
        type: String,
        enum: StatusEnum,
        required: true,
        default:StatusEnum.Active
    },

   

    RestoredBy: { type: Schema.Types.ObjectId, ref: "User" },
    RestoredAt: Date,


}, { timestamps: true })




CourseSchema.virtual('sections', {
    ref: "Section",
    localField: "_id",
    foreignField: "courseId"
});


export type CourseHydareatedDocument = HydratedDocument<ICourse>


export const CourseModel = model<ICourse>("Course", CourseSchema)