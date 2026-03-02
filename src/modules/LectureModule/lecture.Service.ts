import type { Response, Request, NextFunction } from "express"
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory";
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { LectureModel } from "../../Schema/lecture";
import { Types } from "mongoose";
import { EnrollmentRepositry } from "../Utilis/DatabasePattern/EnrollmentRepo";
import { EnrollmentModel } from "../../Schema/Enrollment";
import { CodeRepositry } from "../Utilis/DatabasePattern/CodeRepo";
import { CodeModel, CodeStatusEnum, CodeTypeEnum } from "../../Schema/Code";
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory";
import { CourseModel } from "../../Schema/Course";
import { StatusEnum } from "../Utilis/Enums/courses";

class lectureService {
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel)
    private readonly EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel)
    private readonly CodeModel: CodeRepositry = new CodeRepositry(CodeModel)
    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel)


    constructor() { }

    createlecture = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params
        const { videoUrl, LectureName } = req.body

        const SectionId = Types.ObjectId.createFromHexString(SectionID!)
        const courseId = Types.ObjectId.createFromHexString(CourseId!)

        const [lecture] = await this.LectureModel.create({
            data: [
                {
                    videoUrl,
                    LectureName,
                    SectionId,
                    CourseId: courseId,
                    createdBy: req.user?._id!,
                }
            ]
        }) || []
        if (!lecture) {
            throw new BadRequestException("sorry failed to create the lecture")
        }
        return SuccesResponse({ res, data: { lecture } })
    }

    Updatelecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params
        const { videoUrl, LectureName } = req.body

        const checkLectureName = await this.LectureModel.findOne({
            filter: {
                LectureName
            },
        })

        if (checkLectureName) {
            throw new ConflictException("this leacture name already used by in another lecture")
        }

        const lecture = await this.LectureModel.updateOne({
            filter:
            {
                _id: LectureId,
            },
            update: {
                videoUrl,
                LectureName
            },
        })
        if (!lecture) {
            throw new BadRequestException("sorry this lecture doesnt exists ")
        }
        return SuccesResponse({ res, data: lecture })
    }

    // perfect test and everything is ok
    FreezeLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params
        const Lecture = await this.LectureModel.findOneAndupdate({
            filter: {
                _id: LectureId,
                Status: StatusEnum.Active

            },
            update: {
                Status: StatusEnum.InActive
            }
        })
        if (!Lecture) {
            throw new NotFoundException("sorry failed to freeze the lecture as it must be in IActive status")
        }

        return SuccesResponse({ res, data: Lecture });
    }

    // perfect test and everything is ok
    RestoreLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params

        const Lecture = await this.LectureModel.findOneAndupdate({
            filter: {
                _id: LectureId,
                Status: StatusEnum.InActive
            },
            update: {
                Status: StatusEnum.Active
            },
        })
        if (!Lecture) {
            throw new BadRequestException("sorry failed to Restore the lecture check if its already deleted")
        }
        return SuccesResponse({ res, data: Lecture });
    }

    // perfect test and everything is ok
    DeleteLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params

        const Lecture = await this.LectureModel.findOneAndDelete({
            filter: {
                _id: LectureId,
            },
        })
        if (!Lecture) {
            throw new BadRequestException("sorry failed to Delete the lecture as it must be in IActive status")
        }

        return SuccesResponse({ res })
    }

    // perfect test and everything is ok
    GetLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId, CourseId } = req.params

        const [checkEnrollLecture, checkCourseEnroll] = await Promise.all([

            await this.EnrollmentModel.find({
                filter: {
                    LectureId: Types.ObjectId.createFromHexString(LectureId!),
                }
            }),

            await this.EnrollmentModel.find({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!),
                }
            }),

        ])

        if (!checkEnrollLecture && !checkCourseEnroll) {
            throw new ConflictException("You are not enrolled in this Lecture or the Course")
        }

        
        const Lecture = await this.LectureModel.findOne({
            filter: {
                _id: LectureId,
            },
            options: {
                populate: [{
                    path: 'viewedBy',
                    select: 'fullname phone ParentsPhone'
                }],
                lean: true
            },
        })

        if (!Lecture) {
            throw new NotFoundException("No course found matching criteria");
        }

        const No_Students_NotPlayed = (checkCourseEnroll.length - (Lecture.viewedBy?.length || 0))

        return SuccesResponse({ res, data: { Lecture, No_Students_NotPlayed } });
    }

    ActivateLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params
        const { Code } = req.body


        const checkenrolled = await this.EnrollmentModel.findOne({
            filter: {
                LectureId: Types.ObjectId.createFromHexString(LectureId!),
                UserId: req.user?._id,
                courseId: { $exists: false }
            }
        })

        if (checkenrolled) {
            throw new ConflictException("this User already enrolled in this Lecture")
        }

        const checkCode = await this.CodeModel.findOne({
            filter: {
                Code,
                lectureId: Types.ObjectId.createFromHexString(LectureId!)
            }
        })

        if (checkCode?.CodeType === CodeTypeEnum.General) {

            const enroll = await this.EnrollmentModel.create({
                data: [
                    {
                        UserId: req.user?._id!,
                        LectureId: Types.ObjectId.createFromHexString(LectureId!),
                        CreatedAt: new Date()
                    }
                ]
            }) || []

            if (!enroll) {
                throw new BadRequestException("Sorry Error while Activating Lecture")
            }

            return SuccesResponse({ res })
        }

        const code = await this.CodeModel.findOneAndupdate({
            filter: {
                Code,
                lectureId: Types.ObjectId.createFromHexString(LectureId!),
                CodeStatus: CodeStatusEnum.Unused
            },
            update: {
                Usedby: req.user?._id,
                UsedAt: new Date(),
                CodeStatus: CodeStatusEnum.Used
            },
        })

        if (!code) {
            throw new NotFoundException("this ACtivation Code is Invalid")
        }

        const Enrollment = await this.EnrollmentModel.create({
            data: [
                {
                    UserId: req.user?._id!,
                    LectureId: Types.ObjectId.createFromHexString(LectureId!),
                    CreatedAt: new Date()

                }
            ]
        }) || []


        if (!Enrollment) {
            throw new BadRequestException("Sorry Error while Activating Lecture")
        }

        return SuccesResponse({ res })
    }


    playlecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId, CourseId } = req.params

        const [checkEnrollLecture, checkCourseEnroll] = await Promise.all([

            await this.EnrollmentModel.findOne({
                filter: {
                    LectureId: Types.ObjectId.createFromHexString(LectureId!),
                    UserId: req.user?._id,
                }
            }),

            await this.EnrollmentModel.findOne({
                filter: {
                    courseId: Types.ObjectId.createFromHexString(CourseId!),
                    UserId: req.user?._id,
                }
            }),

        ])

        if (!checkEnrollLecture && !checkCourseEnroll) {
            throw new ConflictException("You are not enrolled in this Lecture or the Course")
        }

        const Lecture = await this.LectureModel.findOneAndupdate({
            filter: {
                _id: Types.ObjectId.createFromHexString(LectureId!),
            },
            update: {
                $addToSet: { viewedBy: req.user?._id }
            }
        })


        if (!Lecture) {
            throw new NotFoundException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: Lecture });
    }



}
export default new lectureService