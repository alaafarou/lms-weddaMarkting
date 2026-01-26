import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import SectionService from "./Section.Service";
import { CreateSectionValidation, getAllSectionsParamsValidation, SectionParamsValidation } from "./Section.validation";
import lectureRouter from "../LectureModule/lecture.Router";
import ExamRouter from "../ExamModule/Exam.Router";

export const SectionRouter = Router({mergeParams:true})

SectionRouter.use("/:SectionID/lecture",lectureRouter)
SectionRouter.use("/:SectionID/Exam",ExamRouter)

/**
 * @openapi
 * /:CourseId/section:
 *   post:
 *     tags: [Sections]
 *     summary: Create new section (Admin only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Module 1: Fundamentals"
 *                 description: Section name
 *     responses:
 *       '201':
 *         description: Section created successfully
 *       '400':
 *         description: Validation error - Invalid CourseId format or invalid section name
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course not found
 *       '500':
 *         description: Internal server error
 */
SectionRouter.post("/",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateSectionValidation),
    SectionService.createSection
)

/**
 * @openapi
 * /:CourseId/section/:SectionID:
 *   patch:
 *     tags: [Sections]
 *     summary: Update section (Admin only)
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
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Module 1: Fundamentals"
 *                 description: Section name
 *     responses:
 *       '201':
 *         description: Section updated successfully
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: section not found
 *       '500':
 *         description: Internal server error
 */
SectionRouter.patch("/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.UpdateSection
)

/**
 * @openapi
 * /:CourseId/section/Delete/:SectionID:
 *   patch:
 *     tags: [Sections]
 *     summary: Delete section (Admin only)
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
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Section deleted successfully
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: section not found
 *       '500':
 *         description: Internal server error
 */
SectionRouter.delete("/Delete/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.DeleteSection
)

/**
 * @openapi
 * /:CourseId/section/freeze/:SectionID:
 *   patch:
 *     tags: [Sections]
 *     summary: freeze section (Admin only)
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
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Section freezed successfully
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: section not found
 *       '500':
 *         description: Internal server error
 */
SectionRouter.delete("/freeze/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.freezeSection
)

/**
 * @openapi
 * /:CourseId/section/restore/:SectionID:
 *   patch:
 *     tags: [Sections]
 *     summary: Restore deleted section (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: CourseId
 *         in: path
 *         description: MongoDB ObjectId of the parent course
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *       - name: SectionID
 *         in: path
 *         description: MongoDB ObjectId of the section to restore
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8b123456789abcdef1234"
 *     responses:
 *       '200':
 *         description: Section restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f8b123456789abcdef1234"
 *                     name:
 *                       type: string
 *                       example: "Module 1: Fundamentals"
 *                     courseId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: "Section restored successfully"
 *       '400':
 *         description: Invalid CourseId or SectionID format
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Section not found or Course is softDeleted 
 *       '409':
 *         description: Section already active (not soft-deleted)
 *       '500':
 *         description: Internal server error
 */
SectionRouter.patch("/restore/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.RestoreSection
)

/**
 * @openapi
 * /:CourseId/section/:SectionID:
 *   get:
 *     tags: [Sections]
 *     summary: get section by id (user and admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: CourseId
 *         in: path
 *         description: MongoDB ObjectId of the parent course
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *       - name: SectionID
 *         in: path
 *         description: MongoDB ObjectId of the section to restore
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f8b123456789abcdef1234"
 *     responses:
 *       '200':
 *         description: Section restored successfully
 *       '400':
 *         description: Invalid CourseId or SectionID format
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Section not found or Course is softDeleted 
 *       '409':
 *         description: Section already active (not soft-deleted)
 *       '500':
 *         description: Internal server error
 */
SectionRouter.get("/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin , roleEnum.user]}),
    validation(SectionParamsValidation),
    SectionService.GetSection
)
/**
 * @openapi
 * /:CourseId/section/:
 *   get:
 *     tags: [Sections]
 *     summary: gett all sections in course section (Admin , user)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: CourseId
 *         in: path
 *         description: MongoDB ObjectId of the parent course
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Section restored successfully
 *       '400':
 *         description: Invalid CourseId or
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '404':
 *         description: Section not found or Course is softDeleted 
 *       '409':
 *         description: Section already active (not soft-deleted)
 *       '500':
 *         description: Internal server error
 */
SectionRouter.get("/",
    Authorization({AcessRoles:[roleEnum.admin , roleEnum.user]}),
    validation(getAllSectionsParamsValidation),
    SectionService.getAllSections
)

export default SectionRouter
