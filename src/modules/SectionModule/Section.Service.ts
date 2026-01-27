import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, NotFoundException } from "../Utilis/response/ErrorResponse"
import { SectionRepositry } from "../Utilis/DatabasePattern/SectionReposatory"
import { Types } from "mongoose"
import { CourseModel } from "../../Schema/Course"
import { SectionModel } from "../../Schema/Section"
import { promise } from "zod"
import { ExamRepositry } from "../Utilis/DatabasePattern/ExamReposatory"
import { ExamModule } from "../../Schema/Exam"
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory"
import { LectureModel } from "../../Schema/lecture"


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
            options: { new: false }
        })
        if (!UpdateSection) {
            throw new NotFoundException("sorry the secton You are trying to update Doesnt exists")
        }
        return SuccesResponse({ res, data: UpdateSection })
    }

    DeleteSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params


        const section = await this.SectionModel.findOneAndDelete({
            filter: {
                _id: SectionID,
                courseId: CourseId,
                DeletedAt: { $exists: true }
            }

        })

        if (!section) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in INActive status")
        }
        return SuccesResponse({ res })
    }

    freezeSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params

        const section = await this.SectionModel.findOneAndDelete({
            filter: {
                _id: SectionID,
                DeletedAt: { $exists: false },
                courseId: CourseId
            }

        })
        if (!section) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in INActive status")
        }
        return SuccesResponse({ res })
    }


    RestoreSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params
        const checkCourse = await this.CourseModel.findOne({
            filter: {
                _id: CourseId,
                DeletedAt: { $exits: false }

            }
        })
        if (!checkCourse) {
            throw new NotFoundException("the Course u want to create section on is InActive")
        }

        const section = await this.CourseModel.findOneAndupdate({
            filter: {
                _id: SectionID,
                DeletedAt: { $exits: true }
            },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,
                $unset: {
                    DeletedAt: 1,
                    DeletedBy: 1
                }
            },
        })
        if (!section) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in IActive status")
        }
        return SuccesResponse({ res })
    }


    GetSection = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params

        const checkCourse = await this.CourseModel.findOne({
            filter: {
                _id: req.params.CourseId,
                DeletedAt:{$exists:false}
            }
        })
        if(!checkCourse) {
            throw new  NotFoundException(" the Course that this Section belong to is freezed or not Found")
        }
        const section = await this.SectionModel.findOne({
            filter: {
                _id: SectionID,
                courseId: CourseId,
                DeletedAt: { $exists: false }
            }
        })
        if (!section) {
            throw new BadRequestException("sorry failed to Deles")
        }

        const [lectures, exams] = await Promise.all([
            await this.LectureModel.find({
                filter:{
                    SectionId:section._id,
                },              
            }),
             await this.ExamModel.find({
                filter:{
                    SectionID:section._id,
                },
            })
        ])
        return SuccesResponse({ res ,data:{section, lectures, exams} })
    }


    getAllSections = async (req: Request, res: Response, next: NextFunction) => {
        const {  CourseId } = req.params

        const sections = await this.SectionModel.find({
            filter: {
                courseId: CourseId,
                DeletedAt: { $exists: false }
            }

        })
        if (!sections) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in INActive status")
        }
        return SuccesResponse({ res , data:sections })
    }

}


export default new SectionService