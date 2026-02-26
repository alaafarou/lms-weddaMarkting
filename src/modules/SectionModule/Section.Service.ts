import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, NotFoundException } from "../Utilis/response/ErrorResponse"
import { SectionRepositry } from "../Utilis/DatabasePattern/SectionReposatory"
import { Types } from "mongoose"
import { CourseModel } from "../../Schema/Course"
import { SectionModel } from "../../Schema/Section"
import { ExamRepositry } from "../Utilis/DatabasePattern/ExamReposatory"
import { ExamModule } from "../../Schema/Exam"
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory"
import { LectureModel } from "../../Schema/lecture"
import { StatusEnum } from "../Utilis/Enums/courses"



class SectionService {

    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel)
    private readonly SectionModel: SectionRepositry = new SectionRepositry(SectionModel)
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel)
    private readonly ExamModel: ExamRepositry = new ExamRepositry(ExamModule)


    constructor() { }


    createSection = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        console.log(req.params.CourseId)
        const checkCourse = await this.CourseModel.findOne({
            filter: {
                _id: req.params.CourseId
            }
        })
        if (!checkCourse) {
            throw new NotFoundException("the Course u want to create section on is not found")
        }
        const [Section] = await this.SectionModel.create({
            data: [
                {
                    name: req.body.name,
                    CreatedBy: req.user?._id!,
                    courseId: Types.ObjectId.createFromHexString(req.params.CourseId!)
                }
            ]
        }) || []

        if (!Section) {
            throw new BadRequestException("sorry failed to Create Section")
        }

        return SuccesResponse({ res, statuscode: 200, data: Section })
    }

    UpdateSection = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { SectionID, CourseId } = req.params

        const UpdateSection = await this.SectionModel.findOneAndupdate({
            filter: {
                _id: SectionID,
                courseId: CourseId,
            },
            update: {
                name: req.body.name,
                UpdatedBy: req.user?._id
            },
        })
        if (!UpdateSection) {
            throw new NotFoundException("sorry the secton You are trying to update Doesnt exists")
        }
        return SuccesResponse({ res, data: UpdateSection })
    }

    DeleteSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID } = req.params

        const SectionId = Types.ObjectId.createFromHexString(SectionID!)

        const section = await this.SectionModel.findOneAndDelete({
            filter: {
                _id: SectionID,
            },
        })
        if (!section) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in INActive status")
        }

        const [lectures, exams] = await Promise.all([
            this.LectureModel.deleteMany({
                filter: {
                    SectionId,
                },
            }),
            this.ExamModel.deleteMany({
                filter: {
                    SectionID: SectionId
                },
            }),
        ])

        if (!lectures || !exams) {
            throw new BadRequestException("sorry failed to Delete the exams and lectures of the Section")
        }
        return SuccesResponse({ res })
    }

    freezeSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID } = req.params

        const section = await this.SectionModel.findOneAndupdate({
            filter: {
                _id: SectionID,
                Status: StatusEnum.Active
            },
            update: {
                Status: StatusEnum.InActive
            },
        })
        if (!section) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in INActive status")
        }

        return SuccesResponse({ res, data: section })
    }

    RestoreSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID } = req.params

        const section = await this.SectionModel.findOneAndupdate({
            filter: {
                _id: SectionID,
                Status: StatusEnum.InActive
            },
            update: {
                Status: StatusEnum.Active
            },
        })
        if (!section) {
            throw new BadRequestException("sorry failed to restore the section ")
        }
        return SuccesResponse({ res, data: section })
    }

    GetSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params
        const { Status } = req.query
        const StatusQuery: any = {}
        if (Status) {
            StatusQuery.Status = Status
        }


        const checkCourse = await this.CourseModel.findOne({
            filter: {
                _id: req.params.CourseId,
            }
        })
        if (!checkCourse) {
            throw new NotFoundException(" the Course that this Section belong to is freezed or not Found")
        }
        const section = await this.SectionModel.findOne({
            filter: {
                _id: SectionID,
                courseId: CourseId,
            }
        })
        if (!section) {
            throw new BadRequestException("sorry failed to Deles")
        }

        const [lectures, exams] = await Promise.all([
            await this.LectureModel.find({
                filter: {
                    SectionId: section._id,
                    ...StatusQuery

                },
                options: {
                    lean: true
                },
                select: "LectureName Status"
            }),
            await this.ExamModel.find({
                filter: {
                    SectionID: section._id,
                    ...StatusQuery
                },
                select: "name Status",
                options: {
                    lean: true
                }
            })
        ])
        return SuccesResponse({ res, data: { section, lectures, exams } })
    }

    getAllSections = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId } = req.params
        const { Status } = req.query
        const filter: any = {}

        filter.courseId = Types.ObjectId.createFromHexString(CourseId!)
        
        if (Status) {
            filter.Status = Status
        }

        const sections = await this.SectionModel.find({
            filter:filter
        })
        if (!sections) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in INActive status")
        }
        return SuccesResponse({ res, data: sections })
    }

}


export default new SectionService