import { HydratedDocument, model, Schema, Types } from "mongoose";


export enum CodeStatusEnum {
    Used = "Used",
    Unused = "Unused"
}

export enum CodeTypeEnum {
    General = "General",
    Private = "Private"
}

export interface ICode {
    Usedby: Types.ObjectId,
    CourseId: Types.ObjectId
    CodeStatus: CodeStatusEnum,
    LectureId:Types.ObjectId
    UsedAt: Date,
    Code: string,
    CodeType:CodeTypeEnum,
    lectureId:Types.ObjectId
}

const CodeSchema = new Schema<ICode>({

    CodeType: {
        type: String,
        enum: CodeTypeEnum,
        default: CodeTypeEnum.Private
    },
    lectureId:{ type: Schema.Types.ObjectId, ref: "Lecture" },
    Code: { type: String, required: true },
    Usedby: { type: Schema.Types.ObjectId, ref: "User" },
    CourseId: { type: Schema.Types.ObjectId, ref: "Course"},
    CodeStatus: {
        type: String,
        enum: CodeStatusEnum,
        default: CodeStatusEnum.Unused
    },
    UsedAt: Date
}, { timestamps: true })




export type CodeHydareatedDocument = HydratedDocument<ICode>


export const CodeModel = model<ICode>("Code", CodeSchema)