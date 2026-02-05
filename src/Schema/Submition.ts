import { HydratedDocument, model, Schema, Types } from "mongoose";
import { IExam } from "./Exam";
import { IUser } from "./UserModel";


export interface ISubmition {
    Student: Types.ObjectId | IUser,
    Exam: Types.ObjectId | IExam,
    grade?: number,
    averageScore: number
    createdAt: Date,
    Ispassed?: boolean,
    IsSubmited?: boolean,
    Answers: [{ index: number, answer: string }]

    RestoredAt?: Date,
    RestoredBy?: Types.ObjectId,

    DeletedAt?: Date,
    DeletedBy?: Types.ObjectId,

}

export const SubmissionSchema = new Schema<ISubmition>({
    Student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    Exam: {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },
    grade: {
        type: Number,
        default: 0
    },
    averageScore: Number,
    Answers: [String],
    Ispassed: { type: Boolean },
    IsSubmited: { type: Boolean, default: false },

    RestoredAt: Date,
    RestoredBy: { type: Schema.Types.ObjectId, ref: "User" },


    DeletedAt: Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },


}, { timestamps: true })



export type SchemaHydratedDocument = HydratedDocument<ISubmition>
export const SubmissionModel = model<ISubmition>("submission", SubmissionSchema)