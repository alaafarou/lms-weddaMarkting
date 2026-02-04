import { z } from 'zod';
import { GradeLevelEnum, SemesterEnum,} from '../Utilis/Enums/courses';
import { CodeStatusEnum, CodeTypeEnum } from '../../Schema/Code';
import { Types } from 'mongoose';



export const GetAllPrivateCodesValidation = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
    }).optional(),

    body: z.strictObject({
        email: z.string("Invalid email format").optional(),
        phone: z.string().optional(),
        name: z.string().optional(),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),
        Semester: z.enum(Object.values(SemesterEnum), {
            message: 'Invalid Semester. Please select either First or Second Semester'
        }).optional(),
        CodeStatus: z.enum(Object.values(CodeStatusEnum), {
            message: 'Invalid CodeStatus. Please select a valid CodeStatus'
        }).optional(),
        Code: z.string().optional()

    }).optional(),
};

export const GetAllGeneralCodesValidation = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
    }).optional(),

    body: z.strictObject({
        name: z.string().optional(),

        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),

        Semester: z.enum(Object.values(SemesterEnum), {
            message: 'Invalid Semester. Please select either First or Second Semester'
        }).optional(),

        Code: z.string()
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only numbers")
            .optional()

    }).optional(),
};


////////////////////////////////////////////////////




export const GetAllCodesLecturesValidation = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
    }).optional(),

    body: z.strictObject({
        LectureName: z.string().optional(),
        CodeStatus: z.enum(Object.values(CodeStatusEnum), {
            message: 'Invalid CodeStatus. Please select a valid CodeStatus'
        }).optional(),
        Code: z.string().optional(),
        CodeType: z.enum(Object.values(CodeTypeEnum)).default(CodeTypeEnum.Private)
    }).optional(),
};

export const Codeparamsvalidation = {
    params: z.strictObject({
        Codeid: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Code ID format'
        }),
    }),
}



/////////////////////////////////////////////////////////

export const GeneratePrivateCodeValidation = {
    body: z.strictObject({
        number: z.number().min(1),
        name: z.string().optional(),
        LectureName: z.string().optional(),
    }).superRefine((Data, ctx) => {
        if (Data.LectureName && Data.name) {
            ctx.addIssue({
                code: "custom",
                path: ["name"],
                message: "Cannot provide both Course name and Lecture name. Please choose one.",
            });
        }
        if (!Data.LectureName && !Data.name) {
            ctx.addIssue({
                code: "custom",
                path: ["name"],
                message: "You must provide either a Course name or a Lecture name.",
            });
        }
    }),
};


export const GeneratePublicCodeValidation = {
    body: z.strictObject({
        name: z.string().optional(),
        LectureName: z.string().optional(),
    }).superRefine((Data, ctx) => {
        if (Data.LectureName && Data.name) {
            ctx.addIssue({
                code: "custom",
                path: ["name"],
                message: "Cannot provide both Course name and Lecture name. Please choose one.",
            });
        }
        if (!Data.LectureName && !Data.name) {
            ctx.addIssue({
                code: "custom",
                path: ["name"],
                message: "You must provide either a Course name or a Lecture name.",
            });
        }
    }),
};









