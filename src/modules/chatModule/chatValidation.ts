import { Types } from "mongoose";
import z from "zod";


export const GetchatValidation= {
    params:z.strictObject({
        userId : z.string().refine((data)=>{
            return Types.ObjectId.isValid(data),{error:"invalid mongoose id"}
        })
    })
}

