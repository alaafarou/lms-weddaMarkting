import z from "zod";
import { CountryEnum, GradeLevelEnum, StudentEnum } from "../Utilis/Enums/courses";
import { roleEnum } from "../../Schema/UserModel";



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
        role: z.enum(["SuperAdmin", "admin", "user"]).optional(),

        Gradelevel: z.nativeEnum(GradeLevelEnum).optional(),
        Country: z.nativeEnum(CountryEnum).default(CountryEnum.Egypt),
        StudentType:z.nativeEnum(StudentEnum).optional(),

        ParentsPhone: z.string().optional(),
        phone: z.string()
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

        // Fullname must have exactly 2 words
        if (data.fullname.split(" ").length !== 2) {
            ctx.addIssue({
                code: "custom",
                path: ["fullname"],
                message: "fullName must be like Alaa Mohamed"
            });
        }

        // If role is user - make fields required
        if (data.role === roleEnum.user) {
            if (!data.Gradelevel) {
                ctx.addIssue({
                    code: "custom",
                    path: ["gradeLevel"],
                    message: "Grade level is required for user role"
                });
            }

            if (!data.StudentType) {
                ctx.addIssue({
                    code: "custom",
                    path: ["StudentType"],
                    message: "StudentType is required for user role"
                });
            }
          
            if (!data.Country) {
                ctx.addIssue({
                    code: "custom",
                    path: ["country"],
                    message: "Country is required for user role"
                });

            }

            if (!data.ParentsPhone && data.Country === CountryEnum.Egypt && !egyptRegex.test(data.ParentsPhone!)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ParentsPhone"],
                    message: "please check that parent phone number is valid for Your country"
                });
            }

            if (!data.ParentsPhone && data.Country === CountryEnum.Oman && !omanRegex.test(data.ParentsPhone!)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ParentsPhone"],
                    message: "please check that parent phone number is valid for Your country"
                });
            }
        }

        // Phone validation based on country
        if (data.Country === CountryEnum.Oman) {
            if (!omanRegex.test(data.phone)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["phone"],
                    message: "Oman phone must be +968xxxxxxxx or 968xxxxxxxx"
                });
            }
        } else {
            // Egypt default
            if (!egyptRegex.test(data.phone)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["phone"],
                    message: "Egypt phone must be 01xxxxxxxxx"
                });
            }

        }
    })
}



export const confirmEmailValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),

        code: z.string()
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only numbers")
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


export const ResendConfrimEmailValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),
    })
}


export const ResendForgotPasswordOtpValidation = {
    body: z.strictObject({
        email: z.email("Invalid email format"),
    })
}


