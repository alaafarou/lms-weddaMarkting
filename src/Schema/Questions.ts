
import { HydratedDocument, model, Schema, Types } from "mongoose";
import { questionEnum } from "../modules/Utilis/Enums/courses";
import { IExam } from "./Exam";



export interface IQuestion {
    question: String,
    type: questionEnum,
    Answers: String[],
    image: string
    correctAnswer: String,
    ExamID: Types.ObjectId | IExam,
    CreatedAt: Date,
    CreatedBy: Types.ObjectId,
    Score:number

    restoredAt: Date,
    restoredBy: Types.ObjectId,

    DeletedAt: Date,
    DeletedBy: Types.ObjectId,

}



export const QuestionsSchema = new Schema<IQuestion>({

    ExamID: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    question: { type: String },
    type: {
        type: String,
        enum: questionEnum,
        required: true
    },
    Score:{
        type:Number,
        required:true,
        default:10
    },
    Answers: {
        type: [String],
    },
    image: String,
    correctAnswer: String,

    CreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },


    DeletedAt: Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },


    restoredAt: Date,
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },



}, { timestamps: true })

export type QuestionHydratedDocument = HydratedDocument<IQuestion>;


// Change your hook to this:
QuestionsSchema.pre('insertMany', function (next, docs) {
    docs.forEach((doc: any) => {
        if (doc.type === questionEnum.true_false) {
            doc.Answers = ['true', 'false'];
        }
    });
    next();
});

export const QuestionModel = model<IQuestion>("Questions", QuestionsSchema)