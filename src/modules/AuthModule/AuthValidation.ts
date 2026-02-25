import z from "zod";
import { CountryEnum, GradeLevelEnum, StudentEnum } from "../Utilis/Enums/courses";



export const SingupValidation = {
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

        GradeLevel: z.enum(Object.values(GradeLevelEnum)),
        Country: z.enum(Object.values(CountryEnum)).default(CountryEnum.Egypt),
        StudentType: z.enum(Object.values(StudentEnum)).default(StudentEnum.Online),

        ParentsPhone: z.string(),
        phone: z.string(),

    }).superRefine((data, ctx) => {
        const egyptRegex = /^01[0-9]{9}$/;
        const omanRegex = /^(?:\+?968)?[2-7][0-9]{7}$/;
        // Confirm password match
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "confirmPassword mismatch with password"
            });
        }

        if (data.Country === CountryEnum.Egypt && !egyptRegex.test(data.ParentsPhone!)) {
            ctx.addIssue({
                code: "custom",
                path: ["ParentsPhone"],
                message: "please check that parent phone number is valid for Your country"
            });
        }

        if (data.Country === CountryEnum.Oman && !omanRegex.test(data.ParentsPhone!)) {
            ctx.addIssue({
                code: "custom",
                path: ["ParentsPhone"],
                message: "please check that parent phone number is valid for Your country"
            });
        }


        if (data.Country === CountryEnum.Oman) {
            if (!omanRegex.test(data.phone!)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["phone"],
                    message: "Oman phone must be +968xxxxxxxx or 968xxxxxxxx"
                });
            }
        } else {
            if (!egyptRegex.test(data.phone!)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["phone"],
                    message: "Egypt phone must be 01xxxxxxxxx"
                });
            }

        }
    })
}


export const loginValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),

        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(20, "Password must not exceed 20 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                {
                    message: "Password must contain uppercase, lowercase, number, and special character (@$!%*?&) "
                }
            ),
    })
}


export const AddAdminValidation = {
    body: z.strictObject({

        email: z.email("Invalid email format"),

        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(20, "Password must not exceed 20 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                {
                    message: "Password must contain uppercase, lowercase, number, and special character (@$!%*?&) "
                }
            ),

        fullname: z.string()
            .min(2, "Fullname must be at least 2 characters")
            .max(50, "Fullname too long"),
    })
}

export const ResetpasswordValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),

        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(20, "Password must not exceed 20 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                {
                    message: "Password must contain uppercase, lowercase, number, and special character (@$!%*?&) "
                }
            ),

        code: z.string()
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only numbers")
    })

}

export const forgotpasswordOtpValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),
    })
}


export const ResendForgotPasswordOtpValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),
    })
}


