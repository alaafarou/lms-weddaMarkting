import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse"
import { IMultter } from "../Utilis/multer/cloud.multer"
import { CourseModel, StatusEnum } from "../../Schema/Course"
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
import { UserModel } from "../../Schema/UserModel"

class CourseService {

    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel);
    private readonly SectionModel: SectionRepositry = new SectionRepositry(SectionModel)
    private readonly ExamModel: ExamRepositry = new ExamRepositry(ExamModule)
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel)
    private readonly EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel)
    private readonly CodeModel: CodeRepositry = new CodeRepositry(CodeModel)
    private readonly UserModel:UserRepositry = new UserRepositry(UserModel)

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
                DeletedAt: new Date(),
                Status
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
    FreezeCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const course = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: false },
                Status: StatusEnum.Active,
            },
            update: {
                DeletedAt: new Date(),
                Status: StatusEnum.InActive,
                DeletedBy: req.user?._id,
                $unset: {
                    RestoredAt: 1,
                    RestoredBy: 1
                },
            },
            options: { new: false }
        })
        if (!course) {
            throw new NotFoundException("sorry failed to Delete the course as it must be in IActive status")
        }

        await Promise.all([

            this.SectionModel.updateMany({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!),
                    DeletedAt: { $exists: false },

                },
                update: {
                    DeletedAt: Date.now(),
                    DeletedBy: req.user?._id,
                    $unset: {
                        RestoredAt: 1,
                        RestoredBy: 1
                    },
                }
            }),


            this.EnrollmentModel.updateMany({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!),
                    DeletedAt: { $exists: false },

                },
                update: {
                    DeletedAt: Date.now(),
                    DeletedBy: req.user?._id,
                    $unset: {
                        RestoredAt: 1,
                        RestoredBy: 1
                    },
                }
            }),

            this.ExamModel.updateMany({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!),
                    DeletedAt: { $exists: false },

                },
                update: {
                    DeletedAt: Date.now(),
                    DeletedBy: req.user?._id,
                    $unset: {
                        RestoredAt: 1,
                        RestoredBy: 1
                    },
                }
            }),

            this.LectureModel.updateMany({
                filter: {
                    course: Types.ObjectId.createFromHexString(CourseId!),
                    DeletedAt: { $exists: false },
                },
                update: {
                    DeletedAt: Date.now(),
                    DeletedBy: req.user?._id,
                    $unset: {
                        RestoredAt: 1,
                        RestoredBy: 1
                    },
                }
            }),
        ])
        return SuccesResponse({ res, statuscode: 200 });
    }

    // perfect test and everything is ok
    RestoreCourse = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        console.log(CourseId)

        const course = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: true },
                Status: StatusEnum.InActive
            },
            update: {
                RestoredAt: Date.now(),
                RestoredBy: req.user?._id,
                Status: StatusEnum.Active,
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
        const { CourseId } = req.params

        if (!CourseId) {
            throw new NotFoundException("CourseId is required");
        }

        const course = await this.CourseModel.findOneAndDelete({
            filter: {
                _id: CourseId,
                DeletedAt: { $exists: true },
                Status: StatusEnum.InActive
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


    GetCourseStudents = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { page, size } = req.query as unknown as { page: number, size: number }
        const { email, fullname } = req.body
        let userIdsFilter:any = []
        
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
                    select: "email fullname lastname firstname phone"
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
        const { GradeLevel, Semester, Status, name } = req.body
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

    // 
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
        const { StudentID } = req.body


        const CheckCourse = await this.EnrollmentModel.findOne({
            filter: {
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                UserId: Types.ObjectId.createFromHexString(StudentID!),
            }
        })

        if (!CheckCourse) {
            throw new NotFoundException("this Student already enrolled in this Course")
        }


        const createEnroll = this.EnrollmentModel.create({
            data: [{
                courseId: Types.ObjectId.createFromHexString(CourseId!),
                UserId: req.user?._id!
            }]
        }) || []


        if (!createEnroll) {
            throw new BadRequestException("failed to Enrolle Student")
        }

        return SuccesResponse({ res });
    };


    DeleteStudent = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { StudentID } = req.body


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
            throw new NotFoundException("sorry cant Delete Student as its Already didnt Enrolle in this Course")
        }

        return SuccesResponse({ res });
    };


    Grade_Semester_Course = async (req: Request, res: Response, next: NextFunction) => {
        const { GradeLevel, Semester } = req.body
        const Courses = await this.CourseModel.find({
            filter: {
                GradeLevel,
                Semester,
                Status: StatusEnum.Active
            },
            select: "name"
        });
        return SuccesResponse({ res, data: Courses });
    };


    // // perfect test and everything is ok
    // GetAllCoursesArchived = async (req: Request, res: Response, next: NextFunction) => {
    //     const { page, size } = req.query as unknown as { page: number, size: number }
    //     const Courses = await this.CourseModel.paginate({
    //         filter: {
    //             ...req.body || {},
    //             DeletedAt: { $exists: true }
    //         },
    //         page,
    //         size,
    //     });
    //     if (!Courses) {
    //         throw new BadRequestException("No courses found matching criteria");
    //     }
    //     return SuccesResponse({ res, data: { Courses } });
    // };

    // perfect test and everything is ok
    // GenerateCodeOtp = async (req: Request, res: Response, next: NextFunction) => {
    //     const { CourseId } = req.params
    //     const { StudentID } = req.body
    //     const [CheckCourse, checkenrolled, User] = await Promise.all([

    //         this.CourseModel.findOne({
    //             filter: {
    //                 _id: CourseId
    //             },
    //             options: {
    //                 populate: [{
    //                     path: "Otps",
    //                     match: { type: OtpEnum.OpenCourse }
    //                 }]
    //             }
    //         }),

    //         this.EnrollmentModel.findOne({
    //             filter: {
    //                 courseId: Types.ObjectId.createFromHexString(CourseId!),
    //                 UserId: Types.ObjectId.createFromHexString(StudentID!)
    //             }
    //         }),

    //         this.UserModel.findOne({ filter: { _id: Types.ObjectId.createFromHexString(StudentID) } })
    //     ]);

    //     if (!CheckCourse) {
    //         throw new NotFoundException("this course is not created");
    //     }

    //     if (!User) {
    //         throw new NotFoundException("this user is not created")
    //     }

    //     if (checkenrolled) {
    //         throw new ConflictException("this User already enrolled in this Course");
    //     }

    //     const TargetOtp = CheckCourse?.Otps.find(val => val.student?.toString() === StudentID);

    //     if (TargetOtp) {
    //         throw new ConflictException(`fail to generate new otp pls try again after ${TargetOtp.expiresAt}`)
    //     }

    //     const [Otp] = await this.OtpModel.create({
    //         data: [
    //             {
    //                 student: Types.ObjectId.createFromHexString(StudentID),
    //                 code: createOtpNumber(),
    //                 type: OtpEnum.OpenCourse,
    //                 expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRES_IN)),
    //                 createdBy: req.user?._id!,
    //                 course: Types.ObjectId.createFromHexString(CourseId!)
    //             }
    //         ]
    //     }) || []


    //     if (!Otp) {
    //         throw new BadRequestException("failed to generate otp for To open Course")
    //     }

    //     return SuccesResponse({ res, data: { Otp } });
    // };

    // ActivateCourseOtp = async (req: Request, res: Response, next: NextFunction) => {
    //     const { CourseId } = req.params
    //     const { Code } = req.body

    //     const course = await this.CourseModel.findOne({
    //         filter: {
    //             _id: CourseId,
    //             DeletedAt: { $exists: false }
    //         },
    //         options: {
    //             populate: [
    //                 {
    //                     path: "Otps",
    //                     match: { type: OtpEnum.OpenCourse }
    //                 }]
    //         }
    //     })
    //     console.log(course?.Otps)

    //     if (!course) {
    //         throw new NotFoundException("this course is not created")
    //     }

    //     const checkenrolled = await this.EnrollmentModel.findOne({
    //         filter: {
    //             courseId: Types.ObjectId.createFromHexString(CourseId!),
    //             UserId: req.user?._id
    //         }
    //     })

    //     if (checkenrolled) {
    //         throw new ConflictException("this User already enrolled in this Course")
    //     }

    //     const TargetOtp = course?.Otps.find(val => val.student?.toString() === req.user?.id);

    //     console.log(TargetOtp)

    //     if (
    //         !(
    //             TargetOtp &&
    //             await CompareHash({ plaintext: Code, HashedValue: TargetOtp.code })
    //         )) {
    //         throw new UnauthorizedException("this User cant use this otp")
    //     }

    //     const [CreateEnrollment, ClearOtp] = await Promise.all([

    //         this.EnrollmentModel.create({
    //             data: [{
    //                 courseId: Types.ObjectId.createFromHexString(CourseId!),
    //                 UserId: req.user?._id!
    //             }]
    //         }) || [],

    //         this.OtpModel.findOneAndDelete({
    //             filter: {
    //                 _id: TargetOtp._id
    //             }
    //         }),

    //     ])
    //     if (!CreateEnrollment || !ClearOtp) {
    //         throw new BadRequestException("failed to Activate the Course")
    //     }
    //     return SuccesResponse({ res, data: CreateEnrollment })
    // }


}

export default new CourseService()

