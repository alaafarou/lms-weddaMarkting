import { HydratedDocument, model, Schema, Types } from "mongoose";
import { GradeLevelEnum,  StatusEnum } from "../modules/Utilis/Enums/courses";



export interface IBook {

    name: string,

    description?: string

    price: Number,


    GradeLevel: GradeLevelEnum,
    
    image?: string,

    CreatedBy: Types.ObjectId,

    UpdatedBy: Types.ObjectId,

    Status:StatusEnum,

}

const BookSchema = new Schema<IBook>({

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
 
    Status:{
        type: String,
        enum: StatusEnum,
        required: true,
        default:StatusEnum.Active
    },



}, { timestamps: true  })




export type BookHydareatedDocument = HydratedDocument<IBook>


export const BookModel = model<IBook>("Book",BookSchema)