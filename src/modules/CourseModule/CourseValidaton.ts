import { Types } from 'mongoose';
import { z } from 'zod';
import { GradeLevelEnum, SemesterEnum, SubjectsEnum } from '../Utilis/Enums/courses';
import { StatusEnum } from '../../Schema/Course';

export const CreateCourseValidation = {
    body: z.strictObject({
        name: z.string().min(1, 'Course name is required').max(100, 'Course name must be less than 100 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters').optional(),
        price: z.coerce.number().min(0, 'Price must be positive'),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }),
        Semester: z.enum(Object.values(SemesterEnum), {
            message: 'Invalid Semester. Please select either First or Second Semester'
        }),
        subject: z.enum(Object.values(SubjectsEnum), {
            message: 'Invalid Subject. Please select a valid school subject'
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

export const UpdateCourseValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    body: z.strictObject({
        name: z.string().min(1, 'Course name is required').max(100, 'Course name must be less than 100 characters').optional(),
        description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters').optional(),
        price: z.coerce.number().min(0, 'Price must be positive').max(50000, 'Price cannot exceed 50,000').optional(),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),
        Semester: z.enum(Object.values(SemesterEnum), {
            message: 'Invalid Semester. Please select either First or Second Semester'
        }).optional(),
        subject: z.enum(Object.values(SubjectsEnum), {
            message: 'Invalid Subject. Please select a valid school subject'
        }).optional(),
        Status: z.enum(Object.values(StatusEnum), {
            message: 'Invalid Status. Please select a valid Status'
        }).optional(),
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

export const checkCourseParam = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    body: z.strictObject({
        StudentID: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid StudentID  format'
        }),
    }),
};

export const CourseParamValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
};


export const AddStudentValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    body: z.strictObject({
        email: z.email("Invalid email format"),
    }),
};


export const getcourseValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
};


export const getCoursestudentsValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        fullname: z.string().optional(),
        email: z.email("Invalid email format").optional(),
    }).optional(),

};



export const ActivateCodeValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    body: z.strictObject({
        Code: z.string()
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only numbers")
    }),

};




export const GenerateCodeValidation = {
    body: z.strictObject({
        number: z.number().min(1),
        name: z.string()
    }),
};



export const GetAllCoursesValidation = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        name: z.string().min(1, 'Course name is required').max(100, 'Course name must be less than 100 characters').optional(),
        description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters').optional(),
        price: z.number().min(0, 'Price must be positive').max(50000, 'Price cannot exceed 50,000').optional(),
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),
        Semester: z.enum(Object.values(SemesterEnum), {
            message: 'Invalid Semester. Please select either First or Second Semester'
        }).optional(),
        subject: z.enum(Object.values(SubjectsEnum), {
            message: 'Invalid Subject. Please select a valid school subject'
        }).optional(),
        Status: z.enum(Object.values(StatusEnum), {
            message: 'Invalid Status. Please select a valid Status'
        }).optional(),
    }).optional(),


}





export const Grade_Semester_CourseValidation = {
    query: z.strictObject({
        GradeLevel: z.enum(Object.values(GradeLevelEnum), {
            message: 'Invalid Grade Level. Please select a valid option'
        }).optional(),
        Semester: z.enum(Object.values(SemesterEnum), {
            message: 'Invalid Semester. Please select either First or Second Semester'
        }).optional(),

    })
}



