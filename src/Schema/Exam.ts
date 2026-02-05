
import { HydratedDocument, model, Schema, Types } from "mongoose";





export interface IExam {

    name: string,
    SectionID: Types.ObjectId,
    CourseID: Types.ObjectId


    CreatedAt: Date,
    CreatedBy: Types.ObjectId,

    UpdatedAt: Date,
    UpdatedBy: Types.ObjectId

    restoredAt: Date,
    restoredBy: Types.ObjectId,

    DeletedAt: Date,
    DeletedBy: Types.ObjectId,

    Duration: number


}

export const ExamSchema = new Schema<IExam>({

    name: {
        type: String,
        maxLength: [100, "name must not exceed 100"],
        minLength: [5, "name must not be less than  5"],
        required: true,
    },

    SectionID: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    CourseID: { type: Schema.Types.ObjectId, ref: "Course", required: true },



    CreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    UpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    DeletedAt: Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },


    restoredAt: Date,
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },

    Duration: {
        type: Number,
        default: 5 * 60,
        required: true
    }

},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})



ExamSchema.virtual('questions', {
    ref: "Question",
    localField: "_id",
    foreignField: "ExamID"
});


export type ExamHydratedDocument = HydratedDocument<IExam>;
export const ExamModule = model<IExam>("Exam", ExamSchema)