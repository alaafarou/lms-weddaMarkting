import { HydratedDocument, model, Schema, Types } from "mongoose";
import { IExam } from "./Exam";
import { IUser } from "./UserModel";


export interface ISubmition {
    Student: Types.ObjectId | IUser,
    Exam: Types.ObjectId | IExam,
    grade?: number,
    CreatedAt: Date,
    Ispassed?: boolean,
    Answers:[{index:number,answer:string}]
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
        default:0
    },
    Answers:[{
        index:{
            type:Number,
            required:true
        },
        answer:{
            type:String,
            required:true
        }
    }],
    Ispassed: {type:Boolean,default:false},

    
}, { timestamps: true })



export type SchemaHydratedDocument =  HydratedDocument<ISubmition>
export const SubmissionModel = model<ISubmition>("submission",SubmissionSchema)