import z from "zod";
import { confirmEmailValidation, forgotpasswordOtpValidation, loginValidation, ResendConfrimEmailValidation, ResendForgotPasswordOtpValidation, ResetpasswordValidation, SingupValidation } from "./AuthValidation";

/**
 * @openapi
 * components:
 *   schemas:
 *     SignupBody:
 *       type: object
 *       required:
 *         - fullname
 *         - email
 *         - password
 *         - confirmPassword
 *         - phone
 *         - role
 *       properties:
 *         fullname:
 *           type: string
 *           example: "Ahmed Ali"
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *         password:
 *           type: string
 *           format: password
 *           writeOnly: true
 *           example: "SecurePass123!"
 *         confirmPassword:
 *           type: string
 *           format: password
 *           writeOnly: true
 *           example: "SecurePass123!"
 *         phone:
 *           type: string
 *           example: "+20123456789"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: "user"
 *         Gradelevel:
 *           type: string
 *           enum:
 *             - First Primary
 *             - Second Primary
 *             - Third Primary
 *             - Fourth Primary
 *             - Fifth Primary
 *             - Sixth Primary
 *             - First Preparatory
 *             - Second Preparatory
 *             - Third Preparatory
 *             - First Secondary
 *             - Second Secondary
 *             - Third Secondary
 *           example: "First Primary"
 *         StudentType:
 *           type: string
 *           enum: [Online, Offline]
 *           example: "Online"
 *         ParentsPhone:
 *           type: string
 *           example: "+201234567890"
 *       allOf:
 *         - if:
 *             properties:
 *               role:
 *                 const: user
 *           then:
 *             required:
 *               - Gradelevel
 *               - StudentType
 *               - ParentsPhone
 *             description: Student registration requires school details
 *         - if:
 *             properties:
 *               role:
 *                 const: admin
 *           then:
 *             description: Admin registration - basic fields only
 */
export type SignupBody = z.infer<typeof SingupValidation.body>;


/**
 * @openapi
 * components:
 *   schemas:
 *     ConfirmEmailBody:
 *       type: object
 *       required: [email, code]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *         code:
 *           type: string
 *           pattern: '^\d{6}$'
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 *     
 *     LoginBody:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *         password:
 *           type: string
 *           writeOnly: true
 *           minLength: 8
 *           maxLength: 20
 *           example: "Pass123!"
 *     
 *     ResetPasswordBody:
 *       type: object
 *       required: [email, password, code]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *         password:
 *           type: string
 *           writeOnly: true
 *           minLength: 8
 *           maxLength: 20
 *           example: "NewPass123!"
 *         code:
 *           type: string
 *           pattern: '^\d{6}$'
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 *     
 *     ForgotPasswordOtpBody:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *     
 *     ResendConfirmEmailBody:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *     
 *     ResendForgotPasswordOtpBody:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *     
 *     SignupBody:
 *       type: object
 *       required: [fullname, email, password, confirmPassword, phone, role]
 *       properties:
 *         fullname: { type: string, example: "Ahmed Ali" }
 *         email: { type: string, format: email, example: "ahmed@example.com" }
 *         password: { type: string, format: password, writeOnly: true, example: "SecurePass123!" }
 *         confirmPassword: { type: string, format: password, writeOnly: true, example: "SecurePass123!" }
 *         phone: { type: string, example: "+20123456789" }
 *         role: { type: string, enum: [user, admin], example: "user" }
 *         Gradelevel:
 *           type: string
 *           enum: [First Primary, Second Primary, Third Primary, Fourth Primary, Fifth Primary, Sixth Primary, First Preparatory, Second Preparatory, Third Preparatory, First Secondary, Second Secondary, Third Secondary]
 *           example: "First Primary"
 *         StudentType: { type: string, enum: [Online, Offline], example: "Online" }
 *         ParentsPhone: { type: string, example: "+201234567890" }
 *       allOf:
 *         - if: { properties: { role: { const: user } } }
 *           then: { required: [Gradelevel, StudentType, ParentsPhone], description: "Student registration requires school details" }
 *         - if: { properties: { role: { const: admin } } }
 *           then: { description: "Admin registration - basic fields only" }
 */
// Your existing Zod validations and type inferences below...


export type confirmEmailBody=z.infer<typeof confirmEmailValidation.body>;


export type LoginBody = z.infer<typeof loginValidation.body>;

export type ResetpasswordBody=z.infer<typeof ResetpasswordValidation.body>;


export type forgotpasswordOtpBody = z.infer<typeof forgotpasswordOtpValidation.body>;

export type ResendConfrimEmailBody=z.infer<typeof ResendConfrimEmailValidation.body>;

export type ResendForgotPasswordOtpBody = z.infer<typeof ResendForgotPasswordOtpValidation.body>;

