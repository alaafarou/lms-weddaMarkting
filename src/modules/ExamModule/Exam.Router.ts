import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import ExamService from "./Exam.Service";
import { CreateExamValidation, ExamparamValidation } from "./Exam.validation";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";



const ExamRouter = Router({mergeParams:true})

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
    Authorization({AcessRoles:[roleEnum.admin]}),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Exam}).array("images"),
    ExamService.FlatenQuestions,
    validation(CreateExamValidation),
    ExamService.CreateExam
)



/**
 * @openapi
 * /:CourseId/section/:SectionID/Exam/:ExamID:
 *   delete:
 *     tags: [Exams]
 *     summary: Hard delete exam (Admin only - must be soft-deleted first)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ExamID
 *         in: path
 *         description: MongoDB ObjectId of the exam to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8b123456789abcdef5678"
 *     responses:
 *       '200':
 *         description: Exam deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Exam deleted successfully"
 *       '400':
 *         description: Invalid ExamID format or Error deleting exam (not soft-deleted)
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Exam not found
 *       '500':
 *         description: Internal server error
 */
ExamRouter.delete("/:ExamID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.DeleteExame
)



/**
 * @openapi
 * /:CourseId/section/:SectionID/Exam/freeze/:ExamID:
 *   delete:
 *     tags: [Exams]
 *     summary: Soft delete/freeze exam (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ExamID
 *         in: path
 *         description: MongoDB ObjectId of the exam to freeze
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8b123456789abcdef5678"
 *     responses:
 *       '200':
 *         description: Exam freezed/soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Exam freezed successfully"
 *       '400':
 *         description: Invalid ExamID format or failed to soft delete exam (already deleted)
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Exam not found or already soft-deleted
 *       '500':
 *         description: Internal server error
 */
ExamRouter.delete("/freeze/:ExamID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.freezExame
)


/**
 * @openapi
 * /:CourseId/section/:SectionID/Exam/restore/:ExamID:
 *   patch:
 *     tags: [Exams]
 *     summary: Restore soft-deleted exam (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: CourseId
 *         in: path
 *         description: MongoDB ObjectId of the course
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *       - name: SectionID
 *         in: path
 *         description: MongoDB ObjectId of the section
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8b123456789abcdef1234"
 *       - name: ExamID
 *         in: path
 *         description: MongoDB ObjectId of the exam to restore
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8b123456789abcdef5678"
 *     responses:
 *       '200':
 *         description: Exam restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Exam restored successfully"
 *       '400':
 *         description: Invalid CourseId/SectionID/ExamID format or failed to restore exam
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Exam not found or not soft-deleted
 *       '409':
 *         description: Cant restore - Section or Course are deleted
 *       '500':
 *         description: Internal server error
 */
ExamRouter.patch("/restore/:ExamID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.restoreExame
)


/**
 * @openapi
 * /courses/:CourseId/exam/:ExamID/start:
 *   post:
 *     tags: 
 *     - Exams
 *     summary: Start exam (Student must be enrolled)
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
 *       name: ExamID
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of exam
 *     responses:
 *       '201':
 *         description: Exam started successfully
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
 *                     Exam:
 *                       type: string
 *                     Student:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: |
 *           - sorry this User is not Enrolled in the Course
 *           - sorry this exam is not Created in the Course
 *           - sorry Errore starting Exam
 *       '409':
 *         description: this Student Already Submitted Exam
 */
ExamRouter.post("/:ExamID",
    Authorization({AcessRoles:[roleEnum.user]}),
    validation(ExamparamValidation),
    ExamService.startExam
)


/**
 * @openapi
 * /courses/:CourseId/exam/:ExamID/submit:
 *   post:
 *     tags: 
 *     - Exams
 *     summary: Submit exam answers with auto-grading
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: CourseId
 *       required: true
 *       schema:
 *         type: string
 *     - in: path
 *       name: ExamID
 *       required: true
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Answers]
 *             properties:
 *               Answers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A", "B", "true", "42"]
 *     responses:
 *       '200':
 *         description: Exam submitted successfully
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
 *                     grade:
 *                       type: number
 *                     Ispassed:
 *                       type: boolean
 *                     Answers:
 *                       type: array
 *                       items:
 *                         type: string
 *       '400':
 *         description: |
 *           - Sorry this Exam cant be submitted
 *           - sorry the Exam time is finished Good luck next time
 *       '404':
 *         description: Sorry no Questions can be found to submit annswers
 */
ExamRouter.patch("/submit/:ExamID",
    Authorization({AcessRoles:[roleEnum.user]}),
    validation(ExamparamValidation),
    ExamService.submiteExame
)



export default ExamRouter