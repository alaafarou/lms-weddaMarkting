import { ExamRepositry } from "../Utilis/DatabasePattern/ExamReposatory"
import type { Request, Response, NextFunction } from "express";
import { SectionRepositry } from "../Utilis/DatabasePattern/SectionReposatory";
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory";
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { Types } from "mongoose";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { SubmissionReposatory } from "../Utilis/DatabasePattern/SubmitExamResposatory";
import { UserRepositry } from "../Utilis/DatabasePattern/UserRepositry";
import { ExamHydratedDocument, ExamModule, IExam } from "../../Schema/Exam";
import { CourseModel } from "../../Schema/Course";
import { SectionModel } from "../../Schema/Section";
import { SubmissionModel } from "../../Schema/Submition";
import { UserModel } from "../../Schema/UserModel";
import { EnrollmentRepositry } from "../Utilis/DatabasePattern/EnrollmentRepo";
import { EnrollmentModel } from "../../Schema/Enrollment";
import { IMultter } from "../Utilis/multer/cloud.multer";
import { QuestionHydratedDocument, QuestionModel } from "../../Schema/Questions";
import { QuestionRepositry } from "../Utilis/DatabasePattern/QuestionsReposatry";
import { StatusEnum } from "../Utilis/Enums/courses";



class ExamService {

    private readonly ExamModel: ExamRepositry = new ExamRepositry(ExamModule)
    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel)
    private readonly SectionModel: SectionRepositry = new SectionRepositry(SectionModel)
    private readonly SubmissionModel: SubmissionReposatory = new SubmissionReposatory(SubmissionModel)
    private readonly UserModel: UserRepositry = new UserRepositry(UserModel)
    private readonly EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel)
    private readonly QuestionModel: QuestionRepositry = new QuestionRepositry(QuestionModel)

    constructor() { }

    FlatenQuestions = async (req: Request, res: Response, next: NextFunction) => {
        const questionsArray = JSON.parse(req.body.questions);
        req.body.questions = questionsArray,
            next()
    }

    CreateExam = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params
        const { name, Duration, questions } = req.body
        const checkSection = await this.SectionModel.findOne({ filter: { _id: SectionID } })
        const files = req.files as IMultter[];
        if (!checkSection) {
            throw new BadRequestException("invalid Section")
        }

        const [Exam] = await this.ExamModel.create({
            data: [
                {
                    SectionID: Types.ObjectId.createFromHexString(SectionID!),
                    CreatedBy: req.user?._id!,
                    CourseID: Types.ObjectId.createFromHexString(CourseId!),
                    name,
                    Duration,
                }
            ]
        }) || []

        if (!Exam) {
            throw new BadRequestException("failed to Create Exam please try later ")
        }


        const finalQuestions: QuestionHydratedDocument[] = questions.map((q: any, index: number) => ({
            ...q,
            ExamID: Exam?._id, // Linking child to parent
            CreatedBy: req.user?._id,
            image: files[index] ? files[index].finalpath : null
        }));


        const created_Questions = await QuestionModel.insertMany(finalQuestions)

        if (!created_Questions) {
            await this.ExamModel.findOneAndDelete({
                filter: {
                    _id: Exam._id
                }
            })
            throw new BadRequestException("sorry failes to create exam ")
        }


        return SuccesResponse({ res, data: Exam })
    }

    UpdateExam = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params
        const { name, Duration } = req.body
        const Exam = await this.ExamModel.findOneAndupdate({
            filter: {
                _id: ExamID,
            },
            update: {
                name,
                Duration
            }
        })

        if (!Exam) {
            throw new BadRequestException("failed to update Exam please try later ")
        }
        return SuccesResponse({ res, data: Exam })
    }

    AddQuestions = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params
        const file = req.file as IMultter;
        const checkExam = await this.ExamModel.findOne({
            filter: {
                _id: ExamID,
            }
        })

        if (!checkExam) {
            throw new BadRequestException("invalid Exam")
        }

        const [CreatedQuestion] = await this.QuestionModel.create({
            data: [
                {
                    ...req.body,
                    ExamID: Types.ObjectId.createFromHexString(ExamID!),
                    CreatedBy: req.user?._id!,
                    image: file ? file.finalpath : null
                }
            ]
        }) || []

        if (!CreatedQuestion) {
            throw new BadRequestException("failed to add question please try later ")
        }

        return SuccesResponse({ res, data: CreatedQuestion })

    }

    DeleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
        const { QuestionID } = req.params

        const DeletedQuestion = await this.QuestionModel.findOneAndDelete({
            filter: {
                _id: QuestionID,
            }
        })

        if (!DeletedQuestion) {
            throw new BadRequestException("failed to delete question please try later ")
        }

        return SuccesResponse({ res })
    }

    GetExam = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params

        const Exam = await this.ExamModel.findOne({
            filter: {
                _id: ExamID
            },

        })
        const Questions = await this.QuestionModel.find({
            filter: {
                ExamID: Types.ObjectId.createFromHexString(ExamID!)
            },
            options: {
                sort: { createdAt: 1 },
            }
        })
        return SuccesResponse({ res, data: { Exam, Questions } })
    }


    startExam = async (req: Request, res: Response, next: NextFunction) => {
        const { CourseId, ExamID } = req.params

        const [CheckEnrolled, Exam, checkSubmission] = await Promise.all(
            [
                this.EnrollmentModel.findOne({
                    filter: {
                        courseId: Types.ObjectId.createFromHexString(CourseId!),
                        UserId: req.user?.id,
                    },
                }),
                this.ExamModel.findOne({
                    filter: {
                        _id: ExamID,
                        CourseID: Types.ObjectId.createFromHexString(CourseId!)
                    }
                }),
                this.SubmissionModel.findOne({
                    filter: {
                        Exam: Types.ObjectId.createFromHexString(ExamID!),
                        Student: req.user?._id!,
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
        if (checkSubmission) {
            throw new ConflictException("this Student Already Submitted Exam")
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
        return SuccesResponse({ res, data: Submission })
    }

    submiteExame = async (req: Request, res: Response, next: NextFunction) => {

        const { ExamID } = req.params
        const { Answers } = req.body as { Answers: string[] }
        let TotalScore = 0
        let EarnedScore = 0


        const [Submission, Questions] = await Promise.all(
            [
                this.SubmissionModel.findOne({
                    filter: {
                        Exam: Types.ObjectId.createFromHexString(ExamID!),
                        Student: req.user?._id
                    },
                    options: {
                        populate: [{
                            path: "Exam",
                            select: "Duration"
                        }]
                    }
                }),
                this.QuestionModel.find({
                    filter: {
                        ExamID: Types.ObjectId.createFromHexString(ExamID!)
                    }, options: {
                        sort: { createdAt: 1 },
                        lean: true
                    },
                })

            ]
        )
        if (Submission?.IsSubmited === true) {
            throw new ConflictException("this Exam is already submited")
        }

        if (!Questions.length || !Submission) {
            throw new NotFoundException("Sorry no Questions can be found to submit annswers")
        }

        Questions.forEach((Question, index) => {
            TotalScore = TotalScore + Number(Question.Score)

            if (Question.correctAnswer === Answers[index]) {
                EarnedScore = EarnedScore + Number(Question.Score)
            }
        })



        const percentage = (EarnedScore / TotalScore) * 100;
        const Ispassed: boolean = percentage > 60 ? true : false


        const startExam = Submission.createdAt.getTime();
        const ExamData = Submission.Exam as unknown as IExam; // Use your Interface
        const ExamTime = ExamData.Duration * 1000 * 60;

        // 1. Check if Time is up (added 30s grace period for network lag)
        const gracePeriod = 30 * 1000;
        if (Date.now() > (startExam + ExamTime + gracePeriod)) {
            return SuccesResponse({
                res,
                message: "sorry the Exam time is finished Good luck next time"
            });
        }

        const UpdateSubmission = await this.SubmissionModel.findOneAndupdate({
            filter: {
                _id: Submission._id
            },
            update: {
                grade: EarnedScore,
                Ispassed,
                Answers,
                IsSubmited: true,
                TotalScore

            }
        })

        if (!UpdateSubmission) {
            throw new BadRequestException("Sorry this Exam cant be submitted")
        }

        return SuccesResponse({ res, data: { UpdateSubmission } })
    }


    StudentExamStatus = async (req: Request, res: Response, next: NextFunction) => {
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

            this.EnrollmentModel.find({
                filter: {
                    UserId: Student.id
                },
                options: {
                    populate: [{
                        path: "courseId",
                        select: "name description image subject"
                    }]
                },
            }),

            this.SubmissionModel.find({
                filter: {
                    Student: Student._id,
                },
                select: "_id grade",
                options: {
                    populate: [{
                        path: 'Exam',
                        select: "name"
                    }]
                }
            })
        ])
        if (!Courses || !Submitted) {
            throw new BadRequestException("sorry failed to fecth data try again later")

        }

        console.log(Submitted)

        // const Grades = Submitted.map(SubmittedExam => SubmittedExam.grade)

        // // let avergareGrade: number = 0;

        // // for (let i = 0; i < Grades.length; i++) {
        // //     avergareGrade = avergareGrade + Grades[i]!
        // // }
        // // const averagePercentage = Math.round((avergareGrade / Grades.length) * 100);

        const CourseId = Courses.map(Course => Course._id)

        const Exams = await this.ExamModel.find({
            filter: {
                CourseID: { $in: CourseId }
            }
        })

        const TotalExams = Exams.length

        const SubmittedExams = Submitted.map(submit => {
            const data = submit.Exam as ExamHydratedDocument
            return data.name
        })

        return SuccesResponse({
            res, data: {
                Student,
                TotalExams,
                TotalCourses: Courses.length,
                TotalSubmitedExams: Submitted.length,
                SubmittedExams,
            }
        })
    }

    DeleteExame = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params

        const Exam = await this.ExamModel.findOneAndDelete({
            filter: {
                _id: Types.ObjectId.createFromHexString(ExamID!),
            }
        })

        const [Submissions, questions] = await Promise.all(
            [
                this.SubmissionModel.deleteMany({
                    filter: {
                        Exam: Types.ObjectId.createFromHexString(ExamID!),
                    }
                }),

                this.QuestionModel.deleteMany({
                    filter: {
                        ExamID: Types.ObjectId.createFromHexString(ExamID!),
                    }
                })
            ]
        )

        if (!Exam) {
            throw new BadRequestException("Error deleting exam")
        }
        return SuccesResponse({ res })
    }


    freezExame = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params
        const Exam = await this.ExamModel.findOneAndupdate({
            filter: { _id: Types.ObjectId.createFromHexString(ExamID!), Status: StatusEnum.Active },
            update: {
                Status: StatusEnum.InActive
            },
        })

        if (!Exam) {
            throw new BadRequestException("failed to soft delet Exam")
        }
        return SuccesResponse({ res, data: Exam })
    }


    restoreExame = async (req: Request, res: Response, next: NextFunction) => {
        const { ExamID } = req.params

        const Exam = await this.ExamModel.findOneAndupdate({
            filter: {
                _id: Types.ObjectId.createFromHexString(ExamID!),
                Status: StatusEnum.InActive
            },
            update: {
                Status: StatusEnum.Active
            }
        })

        if (!Exam) {
            throw new BadRequestException("failed to restore Exam")
        }
        return SuccesResponse({ res, data: Exam })
    }

}


export default new ExamService