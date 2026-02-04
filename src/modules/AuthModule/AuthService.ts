import type { Response, Request, NextFunction } from "express"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry"
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { Types } from "mongoose";
import { createOtpNumber } from "../Utilis/emial/RandomOtp";
import { loginResponse, UserResponse } from "./AuthEntites";
import { OtpEnum } from "../Utilis/emial/email";
import { roleEnum, UserHydratedDocument, UserModel } from "../../Schema/UserModel";
import { CompareHash } from "../Utilis/Security/hash";
import { GenerateCredentials } from "../Utilis/Security/security";
import { OtpRepositry } from "../Utilis/DatabasePattern/OtpResposatory";
import { OtpModel } from "../../Schema/OtpModel";




class AuthenticationService {


    private UserModel = new UserRepositry(UserModel);
    private OtpModel = new OtpRepositry(OtpModel);


    constructor() { }


    private async SendEmail({ userID, type = OtpEnum.confirmEmail }: { userID: Types.ObjectId, type?: OtpEnum }) {
        const [Otp] = await this.OtpModel.create({
            data: [
                {
                    createdBy: userID,
                    code: createOtpNumber(),
                    type,
                    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRES_IN)),
                }
            ]
        }) || []
        if (!Otp) {
            throw new BadRequestException("failed to generate otp for confirm email")
        }

    }

    Singup = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let { email, password, fullname } = req.body
        const checkuser = await this.UserModel.findOne({
            filter: {
                email,
            }
        })

        if (checkuser) {
            throw new ConflictException("this user already created")
        }
        const [user] = await this.UserModel.create({
            data: [
                {
                    fullname,
                    email,
                    password,
                    role:roleEnum.user,
                    ...req.body
                }
            ]
        }) || []

        if (!user) {
            throw new BadRequestException("this user already created")
        }

        return SuccesResponse<UserResponse>({ res, statuscode: 201, data: { user } })
    }


    AddAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let { email, password, fullname } = req.body
        const checkuser = await this.UserModel.findOne({
            filter: {
                email,
            }
        })
        if (checkuser) {
            throw new ConflictException("this Account already used")
        }
        const [user] = await this.UserModel.create({
            data: [
                {
                    fullname,
                    email,
                    password,
                    role: roleEnum.admin,
                }
            ]
        }) || []

        if (!user) {
            throw new BadRequestException("this Error while creating admin account")
        }

        return SuccesResponse<UserResponse>({ res, statuscode: 201, data: { user } })
    }

    forgotpasswordOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { email } = req.body
        const User = await this.UserModel.findOne({
            filter: {
                email,
                deletedAt: { $exists: false },
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.Forgotpassword }
                    }
                ]
            }
        })
        if (!User) {
            throw new NotFoundException("this account not created")
        }
        if (!User.Otps) {
            await this.SendEmail({ userID: User._id, type: OtpEnum.Forgotpassword })
        }
        if (User.Otps && User.Otps.length > 0) {
            const otp = User.Otps[0];
            throw new ConflictException(`Fail to generate new OTP, please try again after ${otp?.expiresAt}`);
        }
        await this.SendEmail({ userID: User._id, type: OtpEnum.Forgotpassword })
        return SuccesResponse({ res, statuscode: 200 })
    }

    ResendForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { email } = req.body

        const User = await this.UserModel.findOne({
            filter: {
                email,
                DeletedAt: { $exists: false }
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.Forgotpassword }
                    }]
            }
        })

        if (!User) {
            throw new NotFoundException("this account already confirmed or doesnt exist")
        }


        if (User.Otps?.length && User.Otps) {
            throw new ConflictException(`fail to generate new otp pls try again after ${User.Otps[0]!.expiresAt}`)
        }

        await this.SendEmail({ userID: User._id, type: OtpEnum.Forgotpassword })

        return SuccesResponse({ res, statuscode: 200, data: {} })
    }


    Resetpassword = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const { email, code, password } = req.body
        const User = await this.UserModel.findOne({
            filter: {
                email,
                deletedAt: { $exists: false },
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.Forgotpassword }
                    }
                ]
            }
        })
        if (!User) {
            throw new NotFoundException("this account does not exist")
        }
        if (!User.Otps || User.Otps.length === 0) {
            throw new NotFoundException("OTP code expired or not found");
        }

        if (!(await CompareHash({ plaintext: code, HashedValue: User.Otps[0]?.code as string }))) {
            throw new BadRequestException("Invalid OTP code");
        }

        User.password = password
        await User.save()
        await this.OtpModel.findOneAndDelete({
            filter: {
                _id: User.Otps[0]!._id,
                type: OtpEnum.Forgotpassword
            }
        })
        return SuccesResponse<UserResponse>({ res, statuscode: 200, data: { user: User } })
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const { email, password } = req.body

        const User = await this.UserModel.findOne({
            filter: {
                email,
                DeletedAt: { $exists: false }
            },
            select: "role fullname password"
        })


        if (!User) {
            throw new NotFoundException("this account doesnt exists")
        }

        if (!await CompareHash({ plaintext: password, HashedValue: User.password })) {
            throw new BadRequestException("sorry wrong password or Email")
        }

        const Credentials = await GenerateCredentials(User as UserHydratedDocument)

        return SuccesResponse<loginResponse>({ res, statuscode: 200, data: { Credentials, user: User } })

    }

}
export default new AuthenticationService();


