import z from "zod";
import { Types } from "mongoose";
import { GradeLevelEnum, StatusEnum } from "../Utilis/Enums/courses";

export const CreateBookValidation = {
    body: z.strictObject({
        name: z.string().min(1, 'Books name is required').max(100, 'Books name must be less than 100 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters').optional(),
        price: z.coerce.number().min(0, 'Price must be positive'),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }),
        Status: z.enum(Object.values(StatusEnum), {
            message: 'Invalid Status. Please select a valid Status'
        }).optional(),
        image: z.object({
            mimetype: z.string(),
            size: z.number(),
            path: z.string(),
        }).optional(),
    })
};

export const UpdateBooksValidation = {
    params: z.strictObject({
        BooksId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Books ID format'
        }),
    }),
    body: z.strictObject({
        name: z.string().min(1, 'Books name is required').max(100, 'Books name must be less than 100 characters').optional(),
        description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters').optional(),
        price: z.coerce.number().min(0, 'Price must be positive').max(50000, 'Price cannot exceed 50,000').optional(),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),
        Status: z.enum(Object.values(StatusEnum), {
            message: 'Invalid Status. Please select a valid Status'
        }).optional(),
        Booklink: z.string().optional(),
        image: z.object({
            mimetype: z.string(),
            size: z.number(),
            path: z.string(),
        }).optional(),
    }).superRefine((data, ctx) => {
        console.log(data)
        const check = Object.values(data)
        if (!check.length) {
            ctx.addIssue({
                code: "custom",
                path: ["body"],
                message: "all of fields in body are empty"
            })
        }
    })
};

export const GetAllBooksValidation = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        name: z.string().min(1, 'Books name is required').max(100, 'Books name must be less than 100 characters').optional(),
        price: z.coerce.number().min(0, 'Price must be positive').max(50000, 'Price cannot exceed 50,000').optional(),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),
        Status: z.enum(Object.values(StatusEnum), {
            message: 'Invalid Status. Please select a valid Status'
        }).optional(),
    }).optional(),
}


export const DeleteBooksValidation = {
    params: z.strictObject({
        BooksId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Books ID format'
        }),
    }),
};