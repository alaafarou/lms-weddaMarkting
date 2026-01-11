import { HydratedDocument, Schema, Types } from "mongoose";
import { GradeLevelEnum, SemesterEnum, SubjectsEnum } from "../modules/Utilis/Enums/courses";
import { IOtp } from "./OtpModel";


export interface ICourse {

    name: string,

    description?: string

    price: Number,

    GradeLevel: GradeLevelEnum,
    Semester: SemesterEnum,
    subject:SubjectsEnum

    image?: string,

    CreatedBy: Types.ObjectId,
 
    UpdatedBy:Types.ObjectId,

    DeletedAt:Date,
    DeletedBy:Types.ObjectId

    RestoredAt:Date,
    RestoredBy:Types.ObjectId,

    Otps:IOtp[]
    students:Types.ObjectId[]

}

export const CourseSchema = new Schema<ICourse>({

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
        required: true
    },

    subject: {
        type: String,
        enum: SubjectsEnum,
        required: true
    },

    students:{type:[Schema.Types.ObjectId],ref:"User"},

    DeletedBy:{ type: Schema.Types.ObjectId, ref: "User" },
    DeletedAt:Date,

    RestoredBy:{ type: Schema.Types.ObjectId, ref: "User" },
    RestoredAt:Date,

     
}, { timestamps: true })





CourseSchema.virtual("Otps", {
  ref: "Otp",
  localField: "_id",
  foreignField: "course"
});


export type CourseHydareatedDocument = HydratedDocument<ICourse>