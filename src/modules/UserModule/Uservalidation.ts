import z from "zod";
import { logoutEnum } from "../Utilis/Security/security";
import { Types } from "mongoose";
import { roleEnum } from "../../Schema/UserModel";
import { CountryEnum, GradeLevelEnum, StatusEnum, StudentEnum } from "../Utilis/Enums/courses";


export const updatepasswordValidaton = {
    body: z.strictObject({
        flag: z.enum(Object.values(logoutEnum)).default(logoutEnum.CurrentDevice),
        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(20, "Password must not exceed 20 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                {
                    message: "Password must contain uppercase, lowercase, number, and special character (@$!%*?&) "
                }
            ),
        newpassword: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(20, "Password must not exceed 20 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                {
                    message: "Password must contain uppercase, lowercase, number, and special character (@$!%*?&) "
                }
            ),
    })
}

export const ProfileValidation = {
    params: z.strictObject({
        UserId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid Mongo Id" })
    }),
}


export const changeroleValidation = {
    params: z.strictObject({
        UserId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid Mongo Id" })
    }),
    body: z.strictObject({
        role: z.enum(Object.values(roleEnum))
    })
}

export const logoutValidation = {
    body: z.strictObject({
        flag: z.enum(Object.values(logoutEnum)).default(logoutEnum.CurrentDevice)
    })
}


export const freezeUserValidation = {
    params: z.strictObject({
        UserId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid Mongo Id" })
    })
}



export const restoreUserValidation = {
    params: z.strictObject({
        UserId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid Mongo Id" })
    })
}


export const DeleteUserValidation = {
    params: z.strictObject({
        UserId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid Mongo Id" })
    })
}


export const ISEnrollendValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid CourseId " })
    })
}




export const GetAllUsersValidation = {
    query: z.strictObject({

        page: z.coerce.number().optional(),

        size: z.coerce.number().optional(),

        fullname: z.string().optional(),

        email: z.email("Invalid email format").optional(),

        password: z.string().optional(),

        Gradelevel: z.enum(Object.values(GradeLevelEnum)).optional(),

        StudentType: z.enum(Object.values(StudentEnum)).optional(),

        Status: z.enum(Object.values(StatusEnum)).optional(),

        phone: z.string().optional()

    }).optional()
}







export const updateProfileValidation = {
    params: z.strictObject({
        UserId: z.string().refine((data) => {
            return Types.ObjectId.isValid(data)
        }, { message: "invalid Mongo Id" })
    }),

    body: z.strictObject({
        fullname: z.string().optional(),
        Gradelevel: z.enum(Object.values(GradeLevelEnum)).optional(),
        phone: z.string().optional(),
        ParentsPhone: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (Object.values(data).every(val => !val)) {
            ctx.addIssue({
                code: "custom",
                path: ["body"],
                message: "all of fields in body are empty"
            })
        }
    })
}






export const AddStudentValidation = {
    body: z.strictObject({
        fullname: z.string()
            .min(2, "Fullname must be at least 2 characters")
            .max(50, "Fullname too long"),

        email: z.email("Invalid email format"),

        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(20, "Password must not exceed 20 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, {
                message: "Password must contain uppercase, lowercase, number, and special character (@$!%*?&) "
            }),

        confirmPassword: z.string(),

        Gradelevel: z.enum(Object.values(GradeLevelEnum)),

        phone: z.string(),

        StudentType: z.enum(Object.values(StudentEnum)).optional().default(StudentEnum.Online),

        Country: z.enum(Object.values(CountryEnum)).optional().default(CountryEnum.Egypt),

    }).superRefine((data, ctx) => {
        const egyptRegex = /^01[0-9]{9}$/;
        // Confirm password match
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "confirmPassword mismatch with password"
            });
        }

        if (!egyptRegex.test(data.phone!)) {
            ctx.addIssue({
                code: "custom",
                path: ["phone"],
                message: "Egypt phone must be 01xxxxxxxxx"
            });
        }

    })

}
