import { ExamRepositry } from "../Utilis/DatabasePattern/ExamReposatory"
import type { Request, Response, NextFunction } from "express";
import { SectionRepositry } from "../Utilis/DatabasePattern/SectionReposatory";
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory";
import { BadRequestException } from "../Utilis/response/ErrorResponse";
import { Types } from "mongoose";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { SubmissionReposatory } from "../Utilis/DatabasePattern/SubmitExamResposatory";
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry";



class ExamService {

    private ExamModel!: ExamRepositry
    private CourseModel!: CourseRepositry
    private SectionModel!: SectionRepositry
    private SubmissionModel!: SubmissionReposatory
    private UserModel!: UserRepositry


    constructor() { }

    private ReinitializeModels(req: Request) {
        const host = req.headers.host
        if (host !== process.env.MAINHOST) {
            const models = req.models;
            this.CourseModel = new CourseRepositry(models?.Course!);
            this.SectionModel = new SectionRepositry(models?.Section!);
            this.ExamModel = new ExamRepositry(models?.Exam!)
            this.SubmissionModel = new SubmissionReposatory(models?.Submission!)
            this.UserModel = new UserRepositry(models?.User!)

        }
    }


    CreateExam = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { SectionID } = req.params
        const { questions, name, Duration } = req.body
        const checkSection = await this.SectionModel.findOne({ filter: { _id: SectionID } })
        if (!checkSection) {
            throw new BadRequestException("invalid Section")
        }
        if (!questions || questions.length === 0) {
            throw new BadRequestException("Exam must have at least one Question ")
        }
        const [Exam] = await this.ExamModel.create({
            data: [
                {
                    SectionID: Types.ObjectId.createFromHexString(SectionID!),
                    CreatedBy: req.user?._id!,
                    name,
                    questions,
                    Duration
                }
            ]
        }) || []
        if (!Exam) {
            throw new BadRequestException("sorry Couldnt create exam")
        }
        return SuccesResponse({ res, data: Exam })
    }
    

    startExam = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { CourseID, ExamID } = req.params
        const [CheckEnrolled, Exam] = await Promise.all(
            [
                this.CourseModel.findOne({
                    filter: {
                        _id: CourseID,
                        students: { $in: [req.user?._id] }
                    },
                }),
                this.ExamModel.findOne({
                    filter: {
                        _id: ExamID
                    }
                })
            ]
        )
        if (!CheckEnrolled) {
            throw new BadRequestException("sorry this User is not Enrolled in the Course")
        }
        if (!Exam) {
            throw new BadRequestException("sorry this exam is not Created in the Course")
        }
        const [Submission] = await this.SubmissionModel.create({
            data: [
                {
                    Exam: Exam._id,
                    Student: req.user?._id!,
                }
            ]
        }) || []

        if (!Submission) {
            throw new BadRequestException("sorry Errore starting Exam")
        }
    }


    submiteExame = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { ExamID } = req.params
        const { Answers } = req.body as { Answers: [{ index: number, answer: string }] }
        let grade: number = 0

        const [Submission, Exam] = await Promise.all(
            [
                this.SubmissionModel.findOne({
                    filter: {
                        Exam: ExamID,
                        Student: req.user?._id
                    }
                }),
                this.ExamModel.findOne({
                    filter: {
                        _id: ExamID
                    }
                })
            ]
        )
        if (!Exam || !Submission) {
            throw new BadRequestException("Erroe while Submiting Answer")
        }

        Exam.questions.forEach((Question, index) => {
            const StudentAnswer = Answers.find(value => value.index === index)
            if (StudentAnswer?.answer === Question.correctAnswer) {
                grade++
            }
        })

        const percentage = (grade / Exam.questions.length) * 100;
        const Ispassed: boolean = percentage > 60 ? true : false


        const startExam = Submission.CreatedAt.getDate()
        const ExamTime = Exam.Duration * 1000;

        if (Date.now() > (startExam + ExamTime)) {

            return SuccesResponse({ res, message: "sorry the Exam time is finished Good luck next time" })
        }

        const UpdateSubmission = await this.SubmissionModel.updateOne({
            filter: {
                _id: Submission._id
            },
            update: {
                grade,
                Ispassed,
                Answers
            }
        })

        if (!UpdateSubmission) {
            throw new BadRequestException("Sorry this Exam cant be submitted")
        }

        return SuccesResponse({ res, data: UpdateSubmission })
    }


    DeleteExame = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params
        // const checkExam = await this.ExamModel.findOne({ filter: { _id: ExamID } })
        // if (!checkExam) {
        //     throw new BadRequestException("invalid Exam")
        // }
        const Exam = await this.ExamModel.findOneAndDelete({
            filter: {
                ExamID,
                DeletedAt: { $exists: true }
            }
        })
        if (!Exam) {
            throw new BadRequestException("Error deleting exam")
        }
        return SuccesResponse({ res })
    }


    freezExame = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params
        const Exam = await this.ExamModel.findOneAndupdate({
            filter: { _id: ExamID, DeletedAt: { $exists: false } },
            update: {
                DeletedAt: new Date(),
                DeletedBy: req.user?._id,
                $unset: {
                    restoredAt: 1,
                    restoredBy: 1
                }
            },
            options: {
                new: false
            }
        })
        if (!Exam) {
            throw new BadRequestException("failed to soft delet Exam")
        }
        return SuccesResponse({ res })
    }


    restoreExame = async (req: Request, res: Response, next: NextFunction) => {

        const { ExamID } = req.params
        const Exam = await this.ExamModel.findOneAndupdate({
            filter: { _id: ExamID, DeletedAt: { $exists: true } },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,
                $unset: {
                    DeletedAt: 1,
                    DeletedBy: 1
                }
            },
            options: {
                new: false
            }
        })
        if (!Exam) {
            throw new BadRequestException("failed to soft delet Exam")
        }
        return SuccesResponse({ res })
    }


    StudentExamStatus = async (req: Request, res: Response, next: NextFunction) => {
        this.ReinitializeModels(req)
        const { phone, ParentsPhone } = req.body

        const Student = await this.UserModel.findOne({
            filter: {
                phone,
                ParentsPhone
            }
        })

        if (!Student) {
            throw new BadRequestException("sorry there is no student with such number ")
        }

        const [Courses, Submitted] = await Promise.all([

            this.CourseModel.find({
                filter: { students: { $in: [Student._id] } },
                select: "_id"
            }),

            this.SubmissionModel.find({
                filter: {
                    Student: Student._id,
                },
                select: "_id grade",
                options: {
                    populate: [{
                        path: 'Exam',  
                    }]
                }
            })
        ])
        if (!Courses || !Submitted) {
            throw new BadRequestException("sorry failed to fecth data try again later")

        }

        const Grades = Submitted.map(SubmittedExam => SubmittedExam.grade)

        let avergareGrade: number = 0;

        for (let i = 0; i < Grades.length; i++) {
            avergareGrade = avergareGrade + Grades[i]!
        }
        const averagePercentage = Math.round((avergareGrade / Grades.length) * 100);

        const CourseId = Courses.map(Course => Course._id)

        const Exams = await this.ExamModel.find({
            filter: {
                DeletedAt: { $exists: false },
                CourseID: { $in: CourseId }
            }
        })

        return SuccesResponse({
            res, data: {
                Student,
                TotalExams: Exams.length,
                TotalCourses: Courses.length,
                TotalSubmitedExams: Submitted.length,
                averagePercentage,
                SubmittedExams:Submitted.map(submit=>{
                    submit.Exam
                })
            }
        })
    }
 
}


export default new ExamService