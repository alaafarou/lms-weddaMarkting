import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import ExamService from "./Exam.Service";
import { AddQuestionValidation, CreateExamValidation, DeleteExamValidation, ExamparamValidation, UpdateExamValidation } from "./Exam.validation";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import { UpdateCourseValidation } from "../CourseModule/CourseValidaton";



const ExamRouter = Router({ mergeParams: true })

/**
 * @openapi
 * /courses/:CourseId/section/:SectionID/exam:
 *   post:
 *     tags: 
 *     - Exams
 *     summary: Create exam with questions (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: CourseId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of course
 *     - in: path
 *       name: SectionID
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of section
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, questions]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "Midterm Mathematics Exam"
 *               Duration:
 *                 type: number
 *                 example: 60
 *               questions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [question, type, correctAnswer]
 *                   properties:
 *                     question:
 *                       type: string
 *                       minLength: 5
 *                       maxLength: 300
 *                     type:
 *                       type: string
 *                       enum: [multiple_choice, true_false, short_answer]
 *                     Answers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     Score:
 *                       type: number
 *                       minimum: 0
 *                     correctAnswer:
 *                       type: string
 *                       minLength: 1
 *     responses:
 *       '201':
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     Duration:
 *                       type: number
 *                     SectionID:
 *                       type: string
 *                     CourseID:
 *                       type: string
 *                     CreatedBy:
 *                       type: string
 *       '400':
 *         description: |
 *           - Invalid SectionID or Course ID format
 *           - name must not be less than 5 / exceed 100
 *           - At least one question required
 *           - Correct answer must be one of provided answers
 *           - Correct answer must be true or false
 *           - invalid Section / failed to Create Exam
 */
ExamRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Exam }).array("images"),
    ExamService.FlatenQuestions,
    validation(CreateExamValidation),
    ExamService.CreateExam
)


ExamRouter.get("/:ExamID", 
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.GetExam
)
 
ExamRouter.patch("/:ExamID", 
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(UpdateExamValidation),
    ExamService.UpdateExam
)

ExamRouter.delete("/:ExamID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.DeleteExame
)


ExamRouter.post("/:ExamID",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ExamparamValidation),
    ExamService.startExam
)


ExamRouter.post("/:ExamID/AddQuestion",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Exam }).single("image"),
    validation(AddQuestionValidation),
    ExamService.AddQuestions
)

ExamRouter.delete("/DeleteQuestion/:QuestionID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(DeleteExamValidation),
    ExamService.DeleteQuestion
)


ExamRouter.delete("/freeze/:ExamID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.freezExame
)


ExamRouter.patch("/restore/:ExamID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.restoreExame
)


ExamRouter.patch("/submit/:ExamID",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ExamparamValidation),
    ExamService.submiteExame
)



export default ExamRouter