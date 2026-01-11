import { model, Schema, Types } from "mongoose";
import type { HydratedDocument } from "mongoose"

export interface ILecture {
    title: string;
    course: Types.ObjectId; // ref to Course
    videoUrl?: string;
    duration?: number; // in seconds or minutes
    description?: string;
    
    RestoredAt: Date,
    RestoredBy: Types.ObjectId;

    DeletedAt: Date,
    DeletedBy: Types.ObjectId;

    createdBy?: Types.ObjectId;
    createdAt?: Date;
}

export const LectureSchema = new Schema<ILecture>({
    title: { type: String, maxLength: 255, required: true },

    videoUrl: { type: String, required: true, unique: true },

    description: { type: String, maxLength: 5000 },
    

    duration: Number,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt:Date,

    RestoredAt: Date,
    RestoredBy: { type: Schema.Types.ObjectId, ref: "User" },


    DeletedAt: Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });

export type LectureHydratedDocuments = HydratedDocument<ILecture>
export const LectureModel = model<ILecture>("Lecture",LectureSchema)
