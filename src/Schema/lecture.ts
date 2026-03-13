import { model, Schema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose"
import { StatusEnum } from "../modules/Utilis/Enums/courses";

export interface ILecture {
    LectureName: string;
    CourseId: Types.ObjectId; // ref to Course
    videoUrl: string;
    SectionId: Types.ObjectId,
    OptionalUrl?: string;
    NameOptionalUrl?: string;

    viewedBy?: Types.ObjectId[];  // Add this

    Status:StatusEnum,
    createdBy?: Types.ObjectId;
    createdAt?: Date;
}

export const LectureSchema = new Schema<ILecture>({

    LectureName: { type: String, maxLength: 255, required: true, unique: true },

    videoUrl: { type: String, required: true },
    viewedBy: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    OptionalUrl:{ type: String},
    NameOptionalUrl:{ type: String},


    CourseId:  { type: Schema.Types.ObjectId, ref: "Course", required: true },
    SectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },


    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: Date,

    Status: {
        type: String,
        enum: StatusEnum,
        required: true,
        default: StatusEnum.Active
    },

}, { timestamps: true });

LectureSchema.index({ _id: 1, 'viewedBy': 1 });

export type LectureHydratedDocuments = HydratedDocument<ILecture>
export const LectureModel = model<ILecture>("Lecture", LectureSchema)
