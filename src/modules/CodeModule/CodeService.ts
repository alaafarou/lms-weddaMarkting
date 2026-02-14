
import type { NextFunction, Response, Request } from "express"
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory"
import { SuccesResponse } from "../Utilis/response/SucessResponse"
import { BadRequestException, ConflictException, NotFoundException, } from "../Utilis/response/ErrorResponse"
import { createOtpNumber } from "../Utilis/emial/RandomOtp"
import { CourseModel } from "../../Schema/Course"
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry"
import { UserModel } from "../../Schema/UserModel"
import { CodeRepositry } from "../Utilis/DatabasePattern/CodeRepo"
import { CodeModel, CodeTypeEnum } from "../../Schema/Code"
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory"
import { LectureModel } from "../../Schema/lecture"
import { StatusEnum } from "../Utilis/Enums/courses"

class CodeService {

    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel);
    private readonly CodeModel: CodeRepositry = new CodeRepositry(CodeModel)
    private readonly UserModel: UserRepositry = new UserRepositry(UserModel)
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel)


    constructor() { }



    GeneratePrivateCode = async (req: Request, res: Response, next: NextFunction) => {
        const { name, number, LectureName } = req.body

        let newCodes = []
        let CodeDateSchema

        for (let i = 0; i < number; i++) {
            const x = createOtpNumber()
            newCodes.push(x)
        }

        if (name && !LectureName) {

            const Course = await this.CourseModel.findOne({
                filter: {
                    name,
                    Status: StatusEnum.Active
                },
            })

            CodeDateSchema = newCodes.map((Code) => ({
                Code,
                CourseId: Course?._id,
            }))

        }

        if (LectureName && !name) {
            const lecture = await this.LectureModel.findOne({
                filter: {
                    LectureName,
                    DeletedAt: { $exists: false }
                },
            })
            CodeDateSchema = newCodes.map((Code) => ({
                Code,
                lectureId: lecture?._id,
            }))
        }

        const CodesCreated = await CodeModel.insertMany(CodeDateSchema)

        if (!CodesCreated) {
            throw new BadRequestException("failed to generate code")
        }
        return SuccesResponse({ res, data: CodesCreated })
    };

    GeneratePublicCode = async (req: Request, res: Response, next: NextFunction) => {
        const { name, LectureName } = req.body


        const random_code = createOtpNumber()
        let CodeQuery: any = {}

        if (name && !LectureName) {
            const Course = await this.CourseModel.findOne({
                filter: {
                    name: name,
                    DeletedAt: { $exists: false },
                    Status: StatusEnum.Active
                },
            })
            if (!Course) {
                throw new NotFoundException("this Course not created")
            }
            CodeQuery = {
                Data: {
                    CodeType: CodeTypeEnum.General,
                    Code: random_code,
                    CourseId: Course?._id!,
                },
                filter: {
                    CourseId: Course?._id,
                    CodeType: CodeTypeEnum.General,
                    lectureId: { $exists: false }
                }
            }
        }


        if (!name && LectureName) {
            const Lecture = await this.LectureModel.findOne({
                filter: {
                    LectureName,
                    DeletedAt: { $exists: false }
                },
            })
            if (!Lecture) {
                throw new NotFoundException("this lecture not created")
            }
            CodeQuery = {
                Data: {
                    CodeType: CodeTypeEnum.General,
                    Code: random_code,
                    lectureId: Lecture?._id!,
                },
                filter: {
                    lectureId: Lecture?._id,
                    CodeType: CodeTypeEnum.General,
                    CourseId: { $exists: false }
                }
            }
        }



        const CheckCode = await this.CodeModel.findOne({
            filter: {
                ...CodeQuery.filter
            },
        })

        if (CheckCode?.lectureId) {
            throw new ConflictException("there is already public Code Generatied for this Lecture")
        }

        if (CheckCode?.CourseId) {
            throw new ConflictException("there is already public Code Generatied for this Course")
        }


        const CodeCreated = await this.CodeModel.create({
            data: [CodeQuery.Data]
        })

        if (!CodeCreated) {
            throw new BadRequestException("failed to generate code")
        }
        return SuccesResponse({ res, data: CodeCreated })
    };


    //////////////////////////////////////////////


    GetAllPrivateCodes = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number };
        const { email, phone, name, Code, GradeLevel, Semester, CodeStatus } = req.query || {};

        let userIdsFilter = {};
        let courseFilter = {};
        let CodeFilter: any = {};

        if (Code || CodeStatus) {
            if (Code) {
                CodeFilter.Code = { $regex: Code, $options: "i" }
            }

            if (CodeStatus) {
                CodeFilter.CodeStatus = CodeStatus
            }

        }

        if (email || phone) {

            let UserQuery: any = {}

            if (email) {
                UserQuery.email = { $regex: email, $options: "i" }
            }
            if (phone) {
                UserQuery.phone = { $regex: phone, $options: "i" }
            }

            const users = await this.UserModel.find({
                filter: UserQuery,
                select: "_id"
            })

            userIdsFilter = { Usedby: { $in: users.map(u => u._id) } };
        }

        if (name || GradeLevel || Semester) {
            let CourseQuery: any = {}

            if (name) {
                CourseQuery.name = { $regex: name, $options: "i" }
            }
            if (GradeLevel) {
                CourseQuery.GradeLevel = GradeLevel
            }
            if (Semester) {
                CourseQuery.Semester = Semester
            }

            const courses = await this.CourseModel.find({
                filter: CourseQuery,
                select: "_id"
            })
            courseFilter = { CourseId: { $in: courses.map(c => c._id) } };
        }

        console.log(courseFilter)

        const Codes = await this.CodeModel.paginate({
            filter: {
                ...courseFilter,
                ...userIdsFilter,
                ...CodeFilter,
                CodeType: CodeTypeEnum.Private,
                lectureId: { $exists: false }
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "Usedby",
                        select: "email fullname phone"
                    },
                    {
                        path: "CourseId",
                        select: "name"
                    }],
                sort: { usedAt: -1 }, // Most recently used first
            },
        });

        return SuccesResponse({ res, data: Codes });
    };


    GetAllGeneralCodes = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number };
        const { name, Code, GradeLevel, Semester } = req.query;

        let courseFilter = {}
        let CodeFilter: any = {}

        if (Code) {

            CodeFilter.Code = { $regex: Code, $options: "i" }
        }

        if (name || GradeLevel || Semester) {
            let CourseQuery: any = {}

            if (name) {
                CourseQuery.name = { $regex: name, $options: "i" }
            }
            if (GradeLevel) {
                CourseQuery.GradeLevel = GradeLevel
            }
            if (Semester) {
                CourseQuery.Semester = Semester
            }

            const courses = await this.CourseModel.find({
                filter: CourseQuery,
                select: "_id"
            })
            courseFilter = { CourseId: { $in: courses.map(c => c._id) } };
        }


        const Codes = await this.CodeModel.paginate({
            filter: {
                ...courseFilter,
                ...CodeFilter,
                CodeType: CodeTypeEnum.General,
                lectureId: { $exists: false }
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "CourseId",
                        select: "name GradeLevel Semester"

                    }],
                sort: { usedAt: -1 } // Most recently used first
            },
        });

        return SuccesResponse({ res, data: Codes });
    };

    //////////////////////////////////////////////



    GetAllCodesLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number };
        const { LectureName, Code, CodeStatus, CodeType } = req.query;
        console.log(CodeType, LectureName, page)
        let LectureFilter = {};
        let CodeFilter: any = {};


        if (Code) {
            CodeFilter.Code = { $regex: Code, $options: "i" }
        }

        if (CodeStatus) {
            CodeFilter.CodeStatus = CodeStatus
        }

        if (CodeType) {
            CodeFilter.CodeType = CodeType
        }


        if (LectureName) {
            const lectures = await this.LectureModel.find({
                filter: {
                    LectureName: { $regex: LectureName, $options: "i" }
                },
            })
            LectureFilter = { LectureId: { $in: lectures.map(L => L._id) } };
        }

        const Codes = await this.CodeModel.paginate({
            filter: {
                ...LectureFilter,
                ...CodeFilter,
            },
            page,
            size,
            options: {
                populate: [{
                    path: "Usedby",
                    select: "email fullname lastname firstname phone Gradelevel"
                },
                {
                    path: "lectureId",
                    select: "LectureName"

                }],
                sort: { usedAt: -1 } // Most recently used first
            },
        });

        return SuccesResponse({ res, data: Codes });
    };


    DeletGeneralCode = async (req: Request, res: Response, next: NextFunction) => {
        const { Codeid } = req.params;
        const code = await this.CodeModel.findOneAndDelete({
            filter: {
                _id: Codeid,
                CodeType: CodeTypeEnum.General
            },
        });

        if (!code) {
            throw new NotFoundException("General code not found");
        }

        return SuccesResponse({ res });
    }


    GetLecturebyCourseName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body

        const Course = await this.CourseModel.findOne({
            filter: {
                name
            },
        })

        if (!Course) {
            throw new NotFoundException("No course found matching criteria");
        }

        const Lecture = await this.LectureModel.find({
            filter: {
                CourseId: Course._id,
            },
            select: "LectureName"
        })

        if (!Lecture) {
            throw new NotFoundException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: Lecture });
    }


    Grade_Semester_Course = async (req: Request, res: Response, next: NextFunction) => {
        const { GradeLevel, Semester } = req.query
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

}

export default new CodeService()

