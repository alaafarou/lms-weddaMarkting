import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, NotFoundException } from "../Utilis/response/ErrorResponse"
import { SectionRepositry } from "../Utilis/DatabasePattern/SectionReposatory"
import { Types } from "mongoose"


class SectionService {

    private  CourseModel!: CourseRepositry
    private  SectionModel!: SectionRepositry

    constructor() { }

    private ReinitializeModels(req: Request) {
        const host = req.headers.host
        if (host) {
            const models = req.models;
            this.CourseModel = new CourseRepositry(models?.Course!);
            this.SectionModel = new SectionRepositry(models?.Section!);
        }
    }


    createSection = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
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

        return SuccesResponse({ res, data: Section })
    }

    UpdateSection = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        this.ReinitializeModels(req)
        const { SectionID, CourseId } = req.params
        const checkCourse = await this.CourseModel.findOne({
            filter: {
                _id: CourseId,

            }
        })
        if (!checkCourse) {
            throw new NotFoundException("the Course u want to create section on is not found")
        }
        const UpdateSection = await this.SectionModel.findOneAndupdate({
            filter: {
                _id: SectionID
            },
            update: {
                name: req.body.name,
                UpdatedBy: req.user?._id
            }
        })
        if (!UpdateSection) {
            throw new BadRequestException("sorry failed to update course please try again later")
        }
        return SuccesResponse({ res, data: UpdateSection })
    }

    DeleteSection = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { SectionID, CourseId } = req.params
        const checkCourse = await this.CourseModel.findOne({
            filter: {
                _id: CourseId
            }
        })
        if (!checkCourse) {
            throw new NotFoundException("the Course u want to create section on is not found")
        }

        const section = await this.CourseModel.findOneAndDelete({
            filter: {
                _id: SectionID
            }

        })
        if (!section) {
            throw new BadRequestException("sorry failed to Delete the section as it must be in IActive status")
        }
        return SuccesResponse({ res })
    }

}


export default new SectionService