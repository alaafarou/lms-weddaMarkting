import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { AddAdminValidation, forgotpasswordOtpValidation, loginValidation, ResendForgotPasswordOtpValidation, ResetpasswordValidation, SingupValidation } from "./AuthValidation";
import AuthService from "./AuthService";


const AuthRouter = Router()


AuthRouter.post("/signup", validation(SingupValidation), AuthService.Singup)

AuthRouter.post("/forgotpassword", validation(forgotpasswordOtpValidation), AuthService.forgotpasswordOtp)

AuthRouter.post("/resendforgotpassword", validation(ResendForgotPasswordOtpValidation), AuthService.ResendForgotPasswordOtp)

AuthRouter.patch("/resetpassword", validation(ResetpasswordValidation), AuthService.Resetpassword)

AuthRouter.post("/login", validation(loginValidation), AuthService.login)

AuthRouter.post("/AddAdmin", validation(AddAdminValidation), AuthService.AddAdmin)


export default AuthRouter



