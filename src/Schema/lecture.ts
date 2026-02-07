import { model, Schema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose"

export interface ILecture {
    LectureName: string;
    CourseId: Types.ObjectId; // ref to Course
    videoUrl: string;
    SectionId:Types.ObjectId,
   
    viewedBy?: Types.ObjectId[];  // Add this

    
    RestoredAt?: Date,
    RestoredBy?: Types.ObjectId;

    DeletedAt: Date,
    DeletedBy: Types.ObjectId;

    createdBy?: Types.ObjectId;
    createdAt?: Date;
}

export const LectureSchema = new Schema<ILecture>({

    LectureName: { type: String, maxLength: 255, required: true , unique: true},

    videoUrl: { type: String, required: true },
    viewedBy: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],


    CourseId:  { type: Schema.Types.ObjectId, ref: "Course", required: true },
    SectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt:Date,

    RestoredAt: Date,
    RestoredBy: { type: Schema.Types.ObjectId, ref: "User" },


    DeletedAt: Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });
LectureSchema.index({ _id: 1, 'viewedBy': 1 });

export type LectureHydratedDocuments = HydratedDocument<ILecture>
export const LectureModel = model<ILecture>("Lecture",LectureSchema)
