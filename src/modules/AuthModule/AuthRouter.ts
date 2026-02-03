import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { AddAdminValidation, forgotpasswordOtpValidation, loginValidation,  ResendForgotPasswordOtpValidation, ResetpasswordValidation, SingupValidation } from "./AuthValidation";
import AuthService from "./AuthService";


const AuthRouter = Router()

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags:
 *       - signup
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/SignupBody'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
AuthRouter.post("/signup",validation(SingupValidation),AuthService.Singup)


/**
 * @openapi
 * /auth/confrimEmail:
 *   patch:
 *     tags:
 *       - confrimEmail
 *     summary: Confirm user email with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ConfirmEmailBody' }
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 confirmedAt: 
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-13T17:58:00.000Z"
 *                 message: { type: string, example: "Email confirmed" }
 *       400: { description: "validation Error" }
 *       409: { description: "Email already confirmed" }
 *       404: {  description: "Account does not exist or already confirmed"}
 */
// AuthRouter.patch("/confrimEmail",validation(confirmEmailValidation),AuthService.ConfrimEmail)

/**
 * @openapi
 * /auth/resendconfrimEmail:
 *   post:
 *     tags:
 *        - resendconfrimEmail 
 *     summary: Resend email confirmation OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResendConfirmEmailBody' }
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example:Done }
 *       400: { description: "validation Error , failed to genertae otp" }
 *       404: {  description: "Account does not exist Or Email already confirmed "}
 *       409: { description:  " cant generate otp as there is already otp created" }
 */
// AuthRouter.post("/resendconfrimEmail",validation(ResendConfrimEmailValidation),AuthService.ResendConfrimEmail)



/**
 * @openapi
 * /auth/forgotpassword:
 *   post:
 *     tags:
 *         - forgotpassword
 *     summary: Send password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ForgotPasswordOtpBody' }
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Done }
 *       400: { description: "validation Error , failed to genertae otp" }
 *       404: {  description: "Account does not exist  "}
 *       409: { description:  " cant generate otp as there is already otp created" }
 */
AuthRouter.post("/forgotpassword",validation(forgotpasswordOtpValidation),AuthService.forgotpasswordOtp)


/**
 * @openapi
 * /auth/resendforgotpassword:
 *   post:
 *     tags:
 *         - resendforgotpassword
 *     summary: Resend password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResendForgotPasswordOtpBody' }
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Done" }
 *       400: { description: "validation Error , failed to genertae otp" }
 *       404: {  description: "Account does not exist  "}
 *       409: { description:  " cant generate otp as there is already otp created" }
 */

AuthRouter.post("/resendforgotpassword",validation(ResendForgotPasswordOtpValidation),AuthService.ResendForgotPasswordOtp)




/**
 * @openapi
 * /auth/resetpassword:
 *   patch:
 *     tags:
 *         - Resetpassword
 *     summary: Reset password using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResetPasswordBody' }  
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Done" }
 *       400: {  description: Invalid OTP code  }
 *       404: {  description: "Account does not exist  "}
 */
AuthRouter.patch("/resetpassword",validation(ResetpasswordValidation),AuthService.Resetpassword)



/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *         - login 
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginBody' }  
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Done" }
 *       400:
 *         description: validation Error / wrong password or Email / Email not confirmed 
 *       404: {  description: "Account does not exist"}
 */
AuthRouter.post("/login",validation(loginValidation),AuthService.login)

AuthRouter.post("/AddAdmin",validation(AddAdminValidation),AuthService.AddAdmin)


AuthRouter.get("/Acesstoken",validation(loginValidation),AuthService.login)

export default AuthRouter



