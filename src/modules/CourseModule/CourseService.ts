import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, ConflictException } from "../Utilis/response/ErrorResponse"
import { IMultter } from "../Utilis/multer/cloud.multer"
import { OtpRepositry } from "../Utilis/DatabasePattern/OtpResposatory"
import { createOtpNumber } from "../Utilis/emial/RandomOtp"
import { OtpEnum } from "../Utilis/emial/email"
import { CompareHash } from "../Utilis/Security/hash"
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry"
import { Types } from "mongoose"


class CourseService {

    private CourseModel!: CourseRepositry
    private OtpModel!: OtpRepositry
    private UserModel!: UserRepositry




    constructor() { }

    private ReinitializeModels(req: Request) {
        const host = req.headers.host
        if (host !== process.env.MAINHOST) {
            const models = req.models;
            this.CourseModel = new CourseRepositry(models?.Course!);
            this.OtpModel = new OtpRepositry(models?.Otp!);
            this.UserModel = new UserRepositry(models?.User!);
        }
        return host
    }


    // perfect test and everything is ok
    createCourse = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const file = req.file as IMultter

        const checkCourse = await this.CourseModel.findOne({
            filter: {
                name: req.body.name,
            }
        })
        if (checkCourse) {
            throw new ConflictException("this course with this name already created")
        }

        const [Course] = await this.CourseModel.create({
            data: [
                {
                    ...req.body,
                    image: file?.finalpath,
                    CreatedBy: req.user?._id!
                }
            ]
        }) || []
        if (!Course) {
            throw new BadRequestException("failed to create this course")
        }
        return SuccesResponse({ res, data: Course })
    }

    // perfect test and everything is ok
    UpdateCourse = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { name } = req.body
        const { CourseId } = req.params
        const file = req.file as IMultter
        if (name && (await this.CourseModel.findOne({
            filter: {
                name,
                _id: CourseId
            }
        }))) {
            throw new ConflictException("therename already used")
        }

        const updateCourse = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId
            },
            update: {
                ...req.body,
                image: file?.finalpath
            }
        })
        if (!updateCourse) {
            throw new BadRequestException("sorry failed to update course please try again later")
        }
        return SuccesResponse({ res, data: updateCourse });
    }

    // perfect test and everything is ok
    FreezeCourse = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params

        const course = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: false }
            },
            update: {
                DeletedAt: Date.now(),
                DeletedBy: req.user?._id,
                $unset: {
                    RestoredAt: 1,
                    RestoredBy: 1
                },
            },
            options: { new: false }
        })
        if (!course) {
            throw new BadRequestException("sorry failed to Delete the course as it must be in IActive status")
        }
        return SuccesResponse({ res });
    }

    // perfect test and everything is ok
    RestoreCourse = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params
        console.log(CourseId)

        const course = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: true }
            },
            update: {
                RestoredAt: Date.now(),
                RestoredBy: req.user?._id,
                $unset: {
                    DeletedAt: 1,
                    DeletedBy: 1,
                },
            },
            options: { new: false }
        })
        if (!course) {
            throw new BadRequestException("sorry failed to Restore the course check if its already deleted")
        }
        return SuccesResponse({ res, });
    }

    // perfect test and everything is ok
    DeleteCourse = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params

        const course = await this.CourseModel.findOneAndDelete({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: true }
            }
        })
        if (!course) {
            throw new BadRequestException("sorry failed to Delete the course as it must be in IActive status")
        }
        return SuccesResponse({ res })
    }

    // perfect test and everything is ok
    GetCourse = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params
        const Course = await this.CourseModel.findOne({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: false }
            }
        })

        if (!Course) {
            throw new BadRequestException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: { Course } });
    };


    // perfect test and everything is ok
    GetCourseArchived = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params
        const Course = await this.CourseModel.findOne({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: true }

            }
        })

        if (!Course) {
            throw new BadRequestException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: { Course } });
    };

    // perfect test and everything is ok
    GetAllCourses = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { page, size } = req.query as unknown as { page: number, size: number }
        const Courses = await this.CourseModel.paginate({
            filter: { ...req.body || {}, DeletedAt: { $exists: false } },
            page,
            size,
        });
        if (!Courses) {
            throw new BadRequestException("No courses found matching criteria");
        }
        return SuccesResponse({ res, data: { Courses } });
    };

    // perfect test and everything is ok
    GetAllCoursesArchived = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { page, size } = req.query as unknown as { page: number, size: number }
        const Courses = await this.CourseModel.paginate({
            filter: {
                ...req.body || {},
                DeletedAt: { $exists: true }
            },
            page,
            size,
        });
        if (!Courses) {
            throw new BadRequestException("No courses found matching criteria");
        }
        return SuccesResponse({ res, data: { Courses } });
    };


    GenerateCode = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params
        console.log(CourseId)
        const { StudentID } = req.body
        const CheckCourse = await this.CourseModel.findOne({
            filter: {
                _id: CourseId
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.OpenCourse }
                    }]
            }
        })
        if (!CheckCourse) {
            throw new BadRequestException("this course is not created")
        }

        if (CheckCourse.students.includes(StudentID)) {
            throw new BadRequestException("this User already enrolled in this Course")
        }

        const TargetOtp = CheckCourse?.Otps.find(val => val.student?.toString() === StudentID);

        if (TargetOtp) {
            throw new BadRequestException(`fail to generate new otp pls try again after ${TargetOtp.expiresAt}`)
        }

        const [Otp] = await this.OtpModel.create({
            data: [
                {
                    student: Types.ObjectId.createFromHexString(StudentID),
                    code: createOtpNumber(),
                    type: OtpEnum.OpenCourse,
                    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRES_IN)),
                    createdBy: req.user?._id!,
                    course: Types.ObjectId.createFromHexString(CourseId!)
                }
            ]
        }) || []


        if (!Otp) {
            throw new BadRequestException("failed to generate otp for To open Course")
        }

        return SuccesResponse({ res, data: { Otp } });
    };


    ActivateCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { Code } = req.body

        this.ReinitializeModels(req)
        const course = await this.CourseModel.findOne({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: false }
            },
            options: {
                populate: [
                    {
                        path: "Otps",
                        match: { type: OtpEnum.OpenCourse }
                    }]
            }
        })
        console.log(course?.Otps)

        if (!course) {
            throw new BadRequestException("this course is not created")
        }

        if (course.students.includes(req.user?._id!)) {
            throw new BadRequestException("this User already enrolled in this Course")
        }

        const TargetOtp = course?.Otps.find(val => val.student?.toString() === req.user?.id);

        console.log(TargetOtp)

        if (
            !(
                TargetOtp &&
                await CompareHash({ plaintext: Code, HashedValue: TargetOtp.code })
            )) {
            throw new BadRequestException("invalid Otp")
        }

        const [updatedCourse] = await Promise.all([

            this.CourseModel.findOneAndupdate({
                filter: {
                    _id: CourseId
                },
                update: {
                    $addToSet: { students: req.user?._id }
                }
            }),

            this.OtpModel.findOneAndDelete({
                filter: {
                    _id: TargetOtp._id
                }
            }),

            this.UserModel.findOneAndupdate({
                filter: {
                    _id: req.user?._id
                },
                update: {
                    $addToSet: { Courses: course._id }
                }
            })
        ])

        return SuccesResponse({ res, data: updatedCourse })
    }


    addUser = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseId } = req.params
        const { StudentID } = req.body
        
        const CheckCourse = await this.CourseModel.findOne({
            filter: {
                _id: CourseId
            }
        })
        if (!CheckCourse) {
            throw new BadRequestException("this course is not created")
        }

        if (CheckCourse.students.includes(StudentID)) {
            throw new BadRequestException("this User already enrolled in this Course")
        }

        const Course = await this.CourseModel.findOneAndupdate({
            filter:{
                _id: CourseId
            },
            update:{
                $addToSet: { students: StudentID }
            }
        })

        if(!Course){
            throw new BadRequestException("failed to Enrolle Student")
        }

        return SuccesResponse({ res});
    };


}
export default new CourseService