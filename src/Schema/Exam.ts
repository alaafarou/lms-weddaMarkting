
import { HydratedDocument, Schema, Types } from "mongoose";
import { questionEnum } from "../modules/Utilis/Enums/courses";



export interface IQuestion {
    question: String,
    type: questionEnum,
    Answers: String[],
    image: string
    correctAnswer: String,
}

export interface IExam {

    name: string,
    SectionID: Types.ObjectId,
    CourseID:Types.ObjectId

    questions: [IQuestion],

    CreatedAt: Date,
    CreatedBy: Types.ObjectId,

    UpdatedAt: Date,
    UpdatedBy: Types.ObjectId

    restoredAt: Date,
    restoredBy: Types.ObjectId,

    DeletedAt: Date,
    DeletedBy: Types.ObjectId,

    Duration:number


}

export const ExamSchema = new Schema<IExam>({

    name: {
        type: String,
        maxLength: [100, "name must not exceed 100"],
        minLength: [5, "name must not be less than  5"],
        required: true,
    },


    SectionID: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    CourseID:    { type: Schema.Types.ObjectId, ref: "Course", required: true },

    questions: [{
        question: { type: String },
        type: {
            type: String,
            enum: questionEnum,
            required: true
        },
        Answers: {
            type: [String],
        },
        image: String,
        correctAnswer: String, // Auto-grading
    }],


    CreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    UpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    DeletedAt: Date,
    DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },


    restoredAt: Date,
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },

    Duration: {
        type: Number,
        default:5*60,
        required: true
    }

}, { timestamps: true })


ExamSchema.pre('save', function (next) {
    for (let question of this.questions) {
        if (!question.Answers || question.Answers.length === 0) {
            if (question.type === questionEnum.true_false) {
                question.Answers = ['true', 'false'];
            }
        }
    }
    next();
});



export type ExamHydratedDocument = HydratedDocument<IExam>;