import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse"
import { IMultter } from "../Utilis/multer/cloud.multer"
import { CourseModel  } from "../../Schema/Course"

import { Types } from "mongoose"
import { SectionRepositry } from "../Utilis/DatabasePattern/SectionReposatory"
import { SectionModel } from "../../Schema/Section"
import { ExamRepositry } from "../Utilis/DatabasePattern/ExamReposatory"
import { ExamModule } from "../../Schema/Exam"
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory"
import { LectureModel } from "../../Schema/lecture"
import { EnrollmentRepositry } from "../Utilis/DatabasePattern/EnrollmentRepo"
import { EnrollmentModel } from "../../Schema/Enrollment"
import { CodeRepositry } from "../Utilis/DatabasePattern/CodeRepo"
import { CodeModel, CodeStatusEnum, CodeTypeEnum } from "../../Schema/Code"
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry"
import { roleEnum, UserModel } from "../../Schema/UserModel"
import { StatusEnum } from "../Utilis/Enums/courses"

class CourseService {

    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel);
    private readonly SectionModel: SectionRepositry = new SectionRepositry(SectionModel)
    private readonly ExamModel: ExamRepositry = new ExamRepositry(ExamModule)
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel)
    private readonly EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel)
    private readonly CodeModel: CodeRepositry = new CodeRepositry(CodeModel)
    private readonly UserModel: UserRepositry = new UserRepositry(UserModel)

    constructor() { }

    // perfect test and everything is ok
    createCourse = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const file = req.file as IMultter
        const Status = req.body.Status

        let Data = {
            ...req.body,
            image: file?.finalpath,
            CreatedBy: req.user?._id!,

        }

        if (Status === StatusEnum.InActive) {
            Data = {
                ...req.body,
                image: file?.finalpath,
                CreatedBy: req.user?._id!,
                Status,
            }

        }

        const checkCourse = await this.CourseModel.findOne({
            filter: {
                name: req.body.name,
            }
        })
        if (checkCourse) {
            throw new ConflictException("this course with this name already created")
        }

        const [Course] = await this.CourseModel.create({
            data: [Data]
        }) || []
        if (!Course) {
            throw new BadRequestException("failed to create this course")
        }
        return SuccesResponse({ res, data: Course })
    }

    // perfect test and everything is ok
    UpdateCourse = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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
        return SuccesResponse({ res, statuscode: 200, data: updateCourse });
    }

    // perfect test and everything is ok
    GetCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params

        const Course = await this.CourseModel.findOne({
            filter: {
                _id: CourseId,
            }
        })

        if (!Course) {
            throw new NotFoundException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: { Course } });
    }

    // perfect test and everything is ok
    GetCourseStudents = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { page, size } = req.query as unknown as { page: number, size: number }
        const { email , fullname } = req.query
        let userIdsFilter: any = []

        if (email || fullname) {

            let UserQuery: any = {}

            if (email) {
                UserQuery.email = { $regex: email, $options: "i" }
            }
            if (fullname) {
                UserQuery.fullname = { $regex: fullname, $options: "i" }
            }

            const users = await this.UserModel.find({
                filter: UserQuery,
                select: "_id"
            })

            userIdsFilter = { UserId: { $in: users.map(u => u._id) } };
        }
        const students = await this.EnrollmentModel.paginate({
            filter: {
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                ...userIdsFilter
            },
            page,
            size,
            options: {
                populate: [{
                    path: "UserId",
                    select: "email fullname phone Gradelevel status"
                }]
            }
        })

        if (!students) {
            throw new NotFoundException("No course found matching criteria");
        }


        return SuccesResponse({ res, data: students });
    }

    // perfect test and everything is ok
    GetAllCourses = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number }
        const { GradeLevel, Semester, Status, name } = req.query
        const query: any = {};

        if (name) query.name = { $regex: name, $options: "i" };
        if (GradeLevel) query.GradeLevel = GradeLevel;
        if (Semester) query.Semester = Semester;
        if (Status) query.Status = Status;

        const Courses = await this.CourseModel.paginate({
            filter: query,
            page,
            size,
        });
        if (!Courses) {
            throw new NotFoundException("No courses found matching criteria");
        }
        return SuccesResponse({ res, data: { Courses } });
    };


    ActivateCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { Code } = req.body

        const checkenrolled = await this.EnrollmentModel.findOne({
            filter: {
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                UserId: req.user?._id
            }
        })

        if (checkenrolled) {
            throw new ConflictException("this User already enrolled in this Course")
        }

        const checkCode = await this.CodeModel.findOne({
            filter: {
                Code
            }
        })

        if (checkCode?.CodeType === CodeTypeEnum.General) {

            const enroll = await this.EnrollmentModel.create({
                data: [
                    {
                        UserId: req.user?._id!,
                        courseId: Types.ObjectId.createFromHexString(CourseId!),
                        CreatedAt: new Date()
                    }
                ]
            }) || []

            if (!enroll) {
                throw new BadRequestException("Sorry Error while Activating Course")
            }

            return SuccesResponse({ res })
        }

        const code = await this.CodeModel.findOneAndupdate({
            filter: {
                Code,
                CourseId: Types.ObjectId.createFromHexString(CourseId!),
                CodeStatus: CodeStatusEnum.Unused
            },
            update: {
                Usedby: req.user?._id,
                UsedAt: new Date(),
                CodeStatus: CodeStatusEnum.Used
            },
            options: { new: false }
        })

        if (!code) {
            throw new NotFoundException("this ACtivation Code is Invalid")
        }

        const Enrollment = await this.EnrollmentModel.create({
            data: [
                {
                    UserId: req.user?._id!,
                    courseId: Types.ObjectId.createFromHexString(CourseId!),
                    CreatedAt: new Date()

                }
            ]
        }) || []


        if (!Enrollment) {
            throw new BadRequestException("Sorry Error while Activating Course")
        }

        return SuccesResponse({ res })
    }


    addUser = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { email } = req.body

        const user = await this.UserModel.findOne({
            filter: {
                email,
                role: roleEnum.user
            }
        })

        if (!user) {
            throw new NotFoundException("sorry this account you try to add is admin or doesnt existe")
        }


        const CheckCourse = await this.EnrollmentModel.findOne({
            filter: {
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                UserId: user?._id,
            }
        })

        if (CheckCourse) {
            throw new NotFoundException("this Student already enrolled in this Course")
        }


        const createEnroll = this.EnrollmentModel.create({
            data: [{
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                UserId: user?._id!
            }]
        }) || []


        if (!createEnroll) {
            throw new BadRequestException("failed to Enrolle Student")
        }

        return SuccesResponse({ res });
    };


    DeleteStudent = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId,StudentID } = req.params

        const CheckCourse = await this.EnrollmentModel.findOneAndDelete({
            filter: {
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                UserId: Types.ObjectId.createFromHexString(StudentID!),
            },
            options: {
                new: false
            }
        })

        if (!CheckCourse) {
            throw new NotFoundException("sorry this Student not enrolled in this Course")
        }

        return SuccesResponse({ res });
    };


    // perfect test and everything is ok
    FreezeCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const course = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId,
                Status: StatusEnum.Active,
            },
            update: {
                Status: StatusEnum.InActive,
               
            },
            options: { new: false }
        })
        if (!course) {
            throw new NotFoundException("sorry failed to Delete the course as it must be in IActive status")
        }

        return SuccesResponse({ res, statuscode: 200 });
    }

    // perfect test and everything is ok
    RestoreCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        console.log(CourseId)

        const course = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId,
                Status: StatusEnum.InActive
            },
            update: {
                Status: StatusEnum.Active,
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
        const { CourseId } = req.params

        if (!CourseId) {
            throw new NotFoundException("CourseId is required");
        }

        const course = await this.CourseModel.findOneAndDelete({
            filter: {
                _id: CourseId,
            },
        })
        if (!course) {
            throw new BadRequestException("sorry failed to Delete the course as it must be in IActive status")
        }
        await Promise.all([

            this.SectionModel.deleteMany({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!)
                },
            }),


            this.EnrollmentModel.deleteMany({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!)
                },
            }),

            this.ExamModel.deleteMany({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!)
                },
            }),

            this.LectureModel.deleteMany({
                filter: {
                    course: Types.ObjectId.createFromHexString(CourseId!)
                },
            }),
        ])

        return SuccesResponse({ res })
    }


}

export default new CourseService()

