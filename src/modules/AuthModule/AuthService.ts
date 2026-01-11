import type { Response, Request, NextFunction } from "express"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry"
import { BadRequestException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { Types } from "mongoose";
import { createOtpNumber } from "../Utilis/emial/RandomOtp";
import { loginResponse, UserResponse } from "./AuthEntites";
import { OtpEnum } from "../Utilis/emial/email";
import { providerEnum, UserHydratedDocument, UserModel } from "../../Schema/UserModel";
import { CompareHash, GenerateHash } from "../Utilis/Security/hash";
import { GenerateCredentials } from "../Utilis/Security/security";
import { OtpRepositry } from "../Utilis/DatabasePattern/OtpResposatory";
import { OtpModel } from "../../Schema/OtpModel";





class AuthenticationService {

    // use this if we want to make multi tenant 
    // private UserModel!: UserRepositry
    // private OtpModel!: OtpRepositry


    private UserModel = new UserRepositry(UserModel);
    private OtpModel = new OtpRepositry(OtpModel);


    constructor() { }

    // private ReinitializeModels(req: Request) {
    //     const host  = req.headers.host
    //     if (host !== process.env.MAINHOST) {
    //         const models = req.models;
    //         this.UserModel = new UserRepositry(models?.User!);
    //         this.OtpModel = new OtpRepositry(models?.Otp!);
    //     }
    //     else{
    //         this.UserModel = new UserRepositry(UserModel);
    //         this.OtpModel = new OtpRepositry(OtpModel);
    //     }
    //     return host

    // }

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
        // const host = this.ReinitializeModels(req)
        let { email, password, fullname , role } = req.body

        // if(host === process.env.MAINHOST)
        // {
        //     role = roleEnum.superadmin
        // }

        // if(host !== process.env.MAINHOST && role === roleEnum.superadmin)
        // {
        //    throw new BadRequestException("sorry SuperAdmin Belong to main App ")
        // }

        console.log({ email, password, fullname })
        const checkuser = await this.UserModel.findOne({
            filter: {
                email,
            }
        })

        if (checkuser) {
            throw new BadRequestException("this user already created")
        }

        if(req.body.ParentsPhone){
            req.body.ParentsPhone = await GenerateHash({plaintext:req.body.phone})
        }

        const [user] = await this.UserModel.create({
            data: [
                {
                    fullname,
                    email,
                    password,
                    role,
                    ...req.body
                }
            ]
        }) || []

        console.log(user)

        if (!user) {
            throw new BadRequestException("this user already created")
        }

        await this.SendEmail({ userID: user._id })

        return SuccesResponse<UserResponse>({ res, data: { user } })
    }

    ResendConfrimEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        // this.ReinitializeModels(req)
        const { email } = req.body

        const User = await this.UserModel.findOne({
            filter: {
                email,
                confrimEmailAt: { $exists: false }
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.confirmEmail }
                    }]
            }
        })

        if (!User) {
            throw new BadRequestException("this account does not exists")
        }


        if (User.Otps?.length && User.Otps) {
            throw new BadRequestException(`fail to generate new otp pls try again after ${User.Otps[0]!.expiresAt}`)
        }

        await this.SendEmail({ userID: User._id })

        return SuccesResponse({ res, data: {} })
    }


    ResendForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        // this.ReinitializeModels(req)
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
            throw new BadRequestException("this account already confirmed or doesnt exist")
        }


        if (User.Otps?.length && User.Otps) {
            throw new BadRequestException(`fail to generate new otp pls try again after ${User.Otps[0]!.expiresAt}`)
        }

        await this.SendEmail({ userID: User._id, type: OtpEnum.Forgotpassword })

        return SuccesResponse({ res, data: {} })
    }

    ConfrimEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        // this.ReinitializeModels(req)
        const { email, code } = req.body

        const User = await this.UserModel.findOne({
            filter: {
                email,
                confrimEmailAt: { $exists: false }
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.confirmEmail }
                    }]
            }
        })

        if (!User) {
            throw new BadRequestException("this account does not exists")
        }

        if (
            !(
                User.Otps?.length &&
                await CompareHash({ plaintext: code, HashedValue: User.Otps[0]!.code })
            )) {
            throw new BadRequestException("invalid otp")
        }

        await this.SendEmail({ userID: User._id })

        User.confrimEmailAt = new Date()

        await User.save()

        await this.OtpModel.findOneAndDelete({
            filter: {
                _id: User.Otps[0]!._id
            }
        })
        return SuccesResponse<UserResponse>({ res, data: { user: User } })
    }


    forgotpasswordOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        // this.ReinitializeModels(req)
        const { email } = req.body
        const User = await this.UserModel.findOne({
            filter: {
                email,
                deletedAt: { $exists: false },
                provider: providerEnum.system
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
            throw new BadRequestException(`Fail to generate new OTP, please try again after ${otp?.expiresAt}`);
        }
        await this.SendEmail({ userID: User._id, type: OtpEnum.Forgotpassword })
        return SuccesResponse({ res })
    }

    Resetpassword = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        // this.ReinitializeModels(req)

        const { email, code, password } = req.body

        const User = await this.UserModel.findOne({
            filter: {
                email,
                deletedAt: { $exists: false },
                provider: providerEnum.system
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
            throw new BadRequestException("this account already confrimed")
        }
        if (!User.Otps || User.Otps.length === 0) {
            throw new NotFoundException("OTP code expired or not found");
        }

        if (!(await CompareHash({ plaintext: code, HashedValue: User.Otps[0]?.code as string }))) {
            throw new BadRequestException("Invalid OTP code");
        }

        User.password = password
        await User.save()
        return SuccesResponse<UserResponse>({ res, data: { user: User } })
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        // this.ReinitializeModels(req)

        const { email, password } = req.body

        const User = await this.UserModel.findOne({
            filter: {
                email,
                DeletedAt: { $exists: false }
            }
        })

        if (!User) {
            throw new NotFoundException("this account doesnt exists")
        }

        if (!User.confrimEmailAt) {
            throw new BadRequestException("this account is not verified yet")
        }

        if (! await CompareHash({ plaintext: password, HashedValue: User.password })) {
            throw new NotFoundException("sorry wrong password or Email")
        }

        const Credentials = await GenerateCredentials(User as UserHydratedDocument)

        return SuccesResponse<loginResponse>({ res, data: { Credentials } })
        
    }

}
export default new AuthenticationService();


