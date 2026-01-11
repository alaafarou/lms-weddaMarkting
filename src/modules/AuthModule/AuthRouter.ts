import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { confirmEmailValidation, forgotpasswordOtpValidation, loginValidation, ResendConfrimEmailValidation, ResendForgotPasswordOtpValidation, ResetpasswordValidation, SingupValidation } from "./AuthValidation";
import AuthService from "./AuthService";
import { DBSwitch } from "../middlwares/DB.middleware";


const AuthRouter = Router()

AuthRouter.post("/signup",DBSwitch,validation(SingupValidation),AuthService.Singup)

AuthRouter.patch("/confrimEmail",DBSwitch,validation(confirmEmailValidation),AuthService.ConfrimEmail)
AuthRouter.post("/resendconfrimEmail",DBSwitch,validation(ResendConfrimEmailValidation),AuthService.ResendConfrimEmail)

AuthRouter.post("/forgotpassword",DBSwitch,validation(forgotpasswordOtpValidation),AuthService.forgotpasswordOtp)
AuthRouter.post("/resendforgotpassword",DBSwitch,validation(ResendForgotPasswordOtpValidation),AuthService.ResendForgotPasswordOtp)

AuthRouter.patch("/resetpassword",DBSwitch,validation(ResetpasswordValidation),AuthService.Resetpassword)
AuthRouter.post("/login",DBSwitch,validation(loginValidation),AuthService.login)


export default AuthRouter



