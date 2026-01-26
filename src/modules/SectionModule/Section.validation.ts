import { Types } from "mongoose";
import z from "zod";




export const CreateSectionValidation = {

    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        })
    }),

    body: z.strictObject({
        name: z.string()
            .min(1, 'Course name is required')
            .max(100, 'Course name must be less than 100 characters'),
    })
    
}


export const SectionParamsValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
    })
}


export const getAllSectionsParamsValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    })
}

