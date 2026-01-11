import z from "zod";
import { logoutEnum } from "../Utilis/Security/security";
import { Types } from "mongoose";
import { roleEnum } from "../../Schema/UserModel";


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


export const changeroleValidation ={
    params:z.strictObject({
        UserId:z.string().refine((data)=>{
            return Types.ObjectId.isValid(data)
        },{message:"invalid Mongo Id"})
    }),
    body:z.strictObject({
        role:z.enum(Object.values(roleEnum))
    })
}

export const logoutValidation ={
    body:z.strictObject({
        flag:z.enum(Object.values(logoutEnum)).default(logoutEnum.CurrentDevice)
    })
}


export const freezeUserValidation ={
    params:z.strictObject({
        UserId:z.string().refine((data)=>{
            return Types.ObjectId.isValid(data)
        },{message:"invalid Mongo Id"})
    })
}

export const restoreUserValidation ={
    params:z.strictObject({
        UserId:z.string().refine((data)=>{
            return Types.ObjectId.isValid(data)
        },{message:"invalid Mongo Id"})
    })
}


export const DeleteUserValidation ={
    params:z.strictObject({
        UserId:z.string().refine((data)=>{
            return Types.ObjectId.isValid(data)
        },{message:"invalid Mongo Id"})
    })
}

