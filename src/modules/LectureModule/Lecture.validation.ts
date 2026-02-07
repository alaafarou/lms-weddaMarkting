import { Types } from "mongoose";
import {  z } from "zod";

export const createLectureValidation = {
    params: z.strictObject({
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    body: z.strictObject({
        videoUrl: z
            .string()
            .url('Must be a valid URL')
            .refine(
                (val) => {
                    const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                    return regex.test(val);
                },
                { message: 'Invalid YouTube URL format' }
            ),
        LectureName: z.string().min(5, "Lecture name must be at least 5 characters").max(100, "Lecture name must not exceed 100 characters"),
    }),
};


export const UpdatelectureValidation = {
    params: z.strictObject({
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        LectureId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Lecture ID format'
        }),
    }),
    body: z.object({
        videoUrl: z
            .string()
            .url('Must be a valid URL')
            .refine(
                (val) => {
                    const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                    return regex.test(val);
                },
                { message: 'Invalid YouTube URL format' }
            ).optional(),
        LectureName:z.string().optional()
    }).superRefine((Data,ctx)=>{
        if(!Data.videoUrl && !Data.LectureName){
            ctx.addIssue({
                path:["Body"],
                code:"custom",
                message:"sorry the body is empty at least one attribute required to update"
            })
        }
    }),
};


export const ActivateCodeValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        LectureId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Lecture ID format'
        }),
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
    }),
    body: z.strictObject({
        Code: z.string()
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only numbers")
    }),

};


export const LectureParamsValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        SectionID: z.string().refine((id) => Types.ObjectId.isValid(id), {
            message: "Invalid Section ID"
        }),

        LectureId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Lecture ID format'
        }),
    }),
};




