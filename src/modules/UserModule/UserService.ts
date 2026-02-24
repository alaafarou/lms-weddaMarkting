import { type Request, type Response, type NextFunction } from "express";
import { roleEnum, UserHydratedDocument, UserModel } from "../../Schema/UserModel";
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { profileimageReponse } from "./UserEntites";
import { IMultter } from "../Utilis/multer/cloud.multer";
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { UserResponse } from "../AuthModule/AuthEntites";
import { createRevokeToken, GenerateCredentials, logoutEnum } from "../Utilis/Security/security";
import { CompareHash, GenerateHash } from "../Utilis/Security/hash";
import { EnrollmentRepositry } from "../Utilis/DatabasePattern/EnrollmentRepo";
import { EnrollmentModel } from "../../Schema/Enrollment";
import { SubmissionReposatory } from "../Utilis/DatabasePattern/SubmitExamResposatory";
import { SubmissionModel } from "../../Schema/Submition";
import { Types } from "mongoose";
import { CountryEnum, StatusEnum, StudentEnum } from "../Utilis/Enums/courses";

class UserService {

    private UserModel: UserRepositry = new UserRepositry(UserModel)
    private EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel)
    private SubmissionModel: SubmissionReposatory = new SubmissionReposatory(SubmissionModel)


    constructor() { }

    profile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { UserId } = req.params
        const User = await this.UserModel.findOne({
            filter: {
                _id: Types.ObjectId.createFromHexString(UserId!)
            }
        })
        if (!User) {
            throw new NotFoundException("sorry this Student not Created")
        }
        return SuccesResponse({ res, data: User })
    }



    UpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { UserId } = req.params
        const User = await this.UserModel.findOneAndupdate({
            filter: {
                _id: Types.ObjectId.createFromHexString(UserId!)
            },
            update: {
                ...req.body
            },
            options: { new: true }
        })
        if (!User) {
            throw new NotFoundException("sorry this Student not Created")
        }
        return SuccesResponse({ res, data: User })
    }

    updateprofileimage = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const file = req.file as IMultter
        const User = await this.UserModel.findOneAndupdate({
            filter: {
                _id: req.user?._id,
                DeletedAt: { $exists: false }
            },
            update: {
                profileimage: file.finalpath,
            }
        })
        if (!User) {
            throw new BadRequestException("failed to update profile image")
        }
        return SuccesResponse<profileimageReponse>({ res, data: { ImagePath: User.profileimage as String, User } })
    }



    GetAllAdmins = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const Admins = await this.UserModel.find({
            filter: {
                role: roleEnum.admin,
                DeletedAt: { $exists: false }
            },
            options: {
                sort: { createdAt: -1 },
                select: "fullname email"
            }
        })
        return SuccesResponse({ res, data: Admins })
    }

    GetAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number }
        const { fullname, email, phone, GradeLevel, Status } = req.query
        const query: any = {};

        if (fullname) query.fullname = { $regex: fullname, $options: "i" };
        if (email) query.email = { $regex: email, $options: "i" };
        if (phone) query.phone = phone;
        if (GradeLevel) query.GradeLevel = GradeLevel;
        if (Status) query.Status = Status;

        const Users = await this.UserModel.paginate({
            filter: { ...query, role: roleEnum.user },
            page,
            size,
        });
        if (!Users) {
            throw new NotFoundException("No users found matching criteria");
        }
        return SuccesResponse({ res, data: { Users } });
    };

    MyCourses = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const Courses = await this.EnrollmentModel.find({
            filter: {
                UserId: req.user?._id,
                LectureId: { $exists: false }
            },
            options: {
                populate: {
                    path: "courseId",
                }
            },
            select: "courseId"
        })
        return SuccesResponse({ res, data: Courses })
    }



    updatepassword = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { password, newpassword, flag } = req.body
        if (! await CompareHash({ plaintext: password, HashedValue: req.user?.password as string })) {
            throw new BadRequestException("this password is wrong ")
        }
        let updateData: any = {}
        switch (flag) {
            case logoutEnum.AllDevices:
                updateData.changeCredentialsTime = new Date()
                break;
            default:
                await createRevokeToken(req)
                break;
        }
        const User = await this.UserModel.findOneAndupdate({
            filter: {
                _id: req.user?._id
            },
            update: {
                password: await GenerateHash({ plaintext: newpassword })
            }
        })
        if (!User) {
            throw new BadRequestException("failed to update the user")
        }
        return SuccesResponse<UserResponse>({ res, data: { user: User } })
    }

    logout = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { flag } = req.body
        let statuscode = 200
        switch (flag) {
            case logoutEnum.AllDevices:
                await this.UserModel.updateOne({
                    filter: {
                        _id: req.user?._id
                    },
                    update: {
                        changeCredentialsTime: new Date()
                    }
                })

                break;

            default:
                await createRevokeToken(req)
                statuscode = 201
                break;
        }

        return SuccesResponse({ res, statuscode })
    }


    RestoreUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { UserId } = req.params;
        const targetUser = await this.UserModel.findOneAndupdate({
            filter: {
                _id:Types.ObjectId.createFromHexString(UserId!),
                DeletedAt: { $exists: true },
                status: StatusEnum.InActive

            },
            update:
            {
                RestoredAt: new Date(),
                RestoredBy: req.user?._id,
                $unset: { DeletedAt: 1, DeletedBy: 1 },
                status: StatusEnum.Active
            },
        })

        if (!targetUser) {
            throw new NotFoundException("User not found or already restored");
        }


        return SuccesResponse({ res, data:targetUser });
    }



    freezeUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { UserId } = req.params;

        const User = await this.UserModel.findOneAndupdate({
            filter: {
                _id:Types.ObjectId.createFromHexString(UserId!),
                DeletedAt: { $exists: false },
                Status: StatusEnum.Active
            },
            update:
            {
                DeletedAt: new Date(),
                DeletedBy: req.user?._id,
                $unset: { RestoredAt: 1, RestoredBy: 1 },
                Status: StatusEnum.InActive
            }
        })

        return SuccesResponse({ res, data: User });
    }

    DeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { UserId } = req.params;
        const User = await this.UserModel.findOneAndDelete({
            filter: {
                _id:Types.ObjectId.createFromHexString(UserId!),
                role: roleEnum.user,
            },
        })
        if (!User) {
            throw new NotFoundException("sorry this user cant be found as it may be already deleted");
        }

        await Promise.all([

            await this.EnrollmentModel.deleteMany({
                filter: {
                    UserId: Types.ObjectId.createFromHexString(UserId!),
                },
            }),

            await this.SubmissionModel.deleteMany({
                filter: {
                    Student: Types.ObjectId.createFromHexString(UserId!),
                },
            })
        ])
        return SuccesResponse({ res, data: "Student Deleted Succesfully" });
    }


    AddStudent = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
            let { email, password, fullname} = req.body
            const StudentType = StudentEnum.Online,
            const Country = CountryEnum.Egypt
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
                        Country,
                        StudentType,
                        ...req.body
                    }
                ]
            }) || []
    
            if (!user) {
                throw new BadRequestException("this user already created")
            }
    
            return SuccesResponse<UserResponse>({ res, statuscode: 201, data: { user } })
        }


    GetAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const user = await this.UserModel.findOne({
            filter: {
                _id: req.user?._id,
                DeletedAt: { $exists: false }
            },
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        const Credentials = await GenerateCredentials(req.user as UserHydratedDocument)

        await createRevokeToken(req)

        return SuccesResponse({ res, data: { token: Credentials } });
    };


    ISEnrollend = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { CourseId } = req.params;
        let ISEnrollend = "false"
        const checkenrolled = await this.EnrollmentModel.findOne({
            filter: {
                UserId: req.user?._id,
                courseId: Types.ObjectId.createFromHexString(CourseId!)
            }
        })
        if (checkenrolled) {
            ISEnrollend = "true"
        }
        return SuccesResponse({ res, data: { ISEnrollend } })
    }

}








export default new UserService() 