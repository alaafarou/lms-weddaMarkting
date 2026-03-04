
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
import ExcelJS from 'exceljs';
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
        console.log(email, name)

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
            console.log(CourseQuery)
            courseFilter = { CourseId: { $in: courses.map(c => c._id) } };
        }

        console.log("this is the Course filter", courseFilter)

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
                        select: "email fullname"
                    },
                    {
                        path: "CourseId",
                        select: "name GradeLevel Semester"
                    }],
                sort: { createdAt: -1 }, // Most recently created first
            },
        });

        console.log(Codes)

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

    DonwloadCoursePrivateCodes = async (req: Request, res: Response, next: NextFunction) => {
        const Codes = await this.CodeModel.find({
            filter: {
                CodeType: CodeTypeEnum.Private,
                lectureId: { $exists: false }
            },
            options: {
                populate: [
                    {
                        path: "Usedby",
                        select: "email fullname"
                    },
                    {
                        path: "CourseId",
                        select: "name GradeLevel Semester"
                    }],
                sort: { createdAt: -1 }, // Most recently created first
            },
        });

        const falttendCodeData = Codes.map((Code: any) => {
            return {
                Code: Code.Code,
                CodeStatus: Code.CodeStatus,
                Usedby: Code.Usedby?.email || null,
                CourseName: Code.CourseId?.name || null,
                GradeLevel: Code.CourseId?.GradeLevel || null,
                Semester: Code.CourseId?.Semester || null,
                createdAt: Code.createdAt,
            }
        })

        // 1. Initialize Workbook and Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Courses Private Codes');

        // 2. Define Columns (The 'key' MUST match the field names in your flattened data)
        worksheet.columns = [
            { header: 'Code', key: 'Code', width: 15 },
            { header: 'Status', key: 'CodeStatus', width: 15 },
            { header: 'Used By', key: 'Usedby', width: 25 },
            { header: 'Course Name', key: 'CourseName', width: 20 },
            { header: 'Grade Level', key: 'GradeLevel', width: 15 },
            { header: 'Semester', key: 'Semester', width: 15 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];

        // 3. Add the flattened data
        worksheet.addRows(falttendCodeData);

        // 4. Set Headers for Download
        const fileName = `Courses_Private_Codes_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // 5. Stream to response
        await workbook.xlsx.write(res);

        res.end();
    }

    //////////////////////////////////////////////

    GetAllCodesLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number };
        const { LectureName, Code, CodeStatus, CodeType } = req.query;
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
                CourseId: { $exists: false }
            },
            page,
            size,
            options: {
                populate: [{
                    path: "Usedby",
                    select: "email"
                },
                {
                    path: "lectureId",
                    select: "LectureName ",
                    populate: {
                        path: "CourseId",
                        select: "name GradeLevel Semester"
                    }
                }],
            },
        });

        console.log(Codes)

        const falttendCodeData = Codes.result.map((Code: any) => {
            return {
                Code: Code.Code,
                CodeStatus: Code.CodeStatus,
                code_id: Code._id || null,
                Usedby: Code.Usedby?.email || null,
                LectureName: Code.lectureId?.LectureName! || null,
                CourseName: Code.lectureId?.CourseId?.name || null,
                GradeLevel: Code.lectureId?.CourseId?.GradeLevel || null,
                Semester: Code.lectureId?.CourseId?.Semester || null,
                usedAt: Code.usedAt || null,
                createdAt: Code.createdAt,
            }
        })

        const Result = {
            pages: Codes.pages,
            countdoc: Codes.countdoc,
            result: falttendCodeData,
            currentpage: Codes.currentpage,
            size: Codes.size,

        }

        return SuccesResponse({ res, data: Result });
    };

    DonwloadLecturePrivateCodes = async (req: Request, res: Response, next: NextFunction) => {
        const Codes = await this.CodeModel.find({
            filter: {
                CodeType: CodeTypeEnum.Private,
                CourseId: { $exists: false }
            },
            options: {
                populate: [{
                    path: "Usedby",
                    select: "email"
                },
                {
                    path: "lectureId",
                    select: "LectureName ",
                    populate: {
                        path: "CourseId",
                        select: "name GradeLevel Semester"
                    }
                }],
            },
        });

        const falttendCodeData = Codes.map((Code: any) => {
            return {
                Code: Code.Code,
                CodeStatus: Code.CodeStatus,
                Usedby: Code.Usedby?.email || null,
                CourseName: Code.lectureId?.CourseId?.name || null,
                GradeLevel: Code.lectureId?.CourseId?.GradeLevel || null,
                Semester: Code.lectureId?.CourseId?.Semester || null,
                createdAt: Code.createdAt,
                lectureName: Code.lectureId?.LectureName || null
            }
        })

        // 1. Initialize Workbook and Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Lectures Private Codes');

        // 2. Define Columns (The 'key' MUST match the field names in your flattened data)
        worksheet.columns = [
            { header: 'Code', key: 'Code', width: 15 },
            { header: 'Status', key: 'CodeStatus', width: 15 },
            { header: 'Used By', key: 'Usedby', width: 25 },
            { header: 'Course Name', key: 'CourseName', width: 20 },
            { header: 'Grade Level', key: 'GradeLevel', width: 15 },
            { header: 'Semester', key: 'Semester', width: 15 },
            { header: 'Lecture Name', key: 'lectureName', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];

        // 3. Add the flattened data
        worksheet.addRows(falttendCodeData);

        // 4. Set Headers for Download
        const fileName = `Lectures_Private_Codes_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // 5. Stream to response
        await workbook.xlsx.write(res);
        res.end();
    }

    ///////////////////////////////////////////

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

    ///////////////////////////////////////
    GetLecturebyCourseName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.query

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

