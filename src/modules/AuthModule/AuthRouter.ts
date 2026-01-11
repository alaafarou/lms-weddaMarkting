import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { confirmEmailValidation, forgotpasswordOtpValidation, loginValidation, ResendConfrimEmailValidation, ResendForgotPasswordOtpValidation, ResetpasswordValidation, SingupValidation } from "./AuthValidation";
import AuthService from "./AuthService";


const AuthRouter = Router()

AuthRouter.post("/signup",validation(SingupValidation),AuthService.Singup)

AuthRouter.patch("/confrimEmail",validation(confirmEmailValidation),AuthService.ConfrimEmail)
AuthRouter.post("/resendconfrimEmail",validation(ResendConfrimEmailValidation),AuthService.ResendConfrimEmail)

AuthRouter.post("/forgotpassword",validation(forgotpasswordOtpValidation),AuthService.forgotpasswordOtp)
AuthRouter.post("/resendforgotpassword",validation(ResendForgotPasswordOtpValidation),AuthService.ResendForgotPasswordOtp)

AuthRouter.patch("/resetpassword",validation(ResetpasswordValidation),AuthService.Resetpassword)
AuthRouter.post("/login",validation(loginValidation),AuthService.login)


export default AuthRouter



