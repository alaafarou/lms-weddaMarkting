import { Router } from "express"
import { Authorization } from "../middlwares/Authentication.middleware"
import { roleEnum } from "../../Schema/UserModel"
import lectureService from "./lecture.Service"
import { ActivateCodeValidation, createLectureValidation, GetLecturebyCourseNameValidation, LectureParamsValidation, UpdatelectureValidation } from "./Lecture.validation"
import { validation } from "../middlwares/validation.middleware"


const lectureRouter = Router({ mergeParams: true })



/**
 * @openapi
 * /courses/:CourseId/section/:SectionID/lecture:
 *   post:
 *     tags: 
 *     - Lectures
 *     summary: Create new lecture (Admin only)
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
 *             required: [videoUrl, LectureName]
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://youtube.com/watch?v=dQw4w9WgXcQ"
 *               LectureName:
 *                 type: string
 *                 example: "Introduction to Algebra"
 *     responses:
 *       '201':
 *         description: Lecture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     lecture:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         videoUrl:
 *                           type: string
 *                         LectureName:
 *                           type: string
 *                         SectionId:
 *                           type: string
 *                         CourseId:
 *                           type: string
 *                         createdBy:
 *                           type: string
 *       '400':
 *         description: Invalid SectionID/CourseId format or sorry failed to create the lecture
 */
lectureRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(createLectureValidation),
    lectureService.createlecture)

/**
 * @openapi
 * /courses/:CourseId/section/:SectionID/lecture/:LectureId:
 *   patch:
 *     tags: 
 *     - Lectures
 *     summary: Update lecture video or name (Admin only)
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
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://youtube.com/watch?v=dQw4w9WgXcQ"
 *               LectureName:
 *                 type: string
 *                 example: "Advanced Algebra Concepts"
 *             minProperties: 1
 *     responses:
 *       '200':
 *         description: Lecture updated successfully
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
 *                     videoUrl:
 *                       type: string
 *                     LectureName:
 *                       type: string
 *                     SectionId:
 *                       type: string
 *                     CourseId:
 *                       type: string
 *       '400':
 *         description: |
 *           - Invalid CourseId/SectionID/LectureId format
 *           - sorry the body is empty at least one attribute required to update
 *           - sorry this lecture doesnt exists
 */
lectureRouter.patch("/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(UpdatelectureValidation),
    lectureService.Updatelecture)


/**
 * @openapi
 * /courses/:CourseId/section/:SectionID/lecture/Activate/:LectureId:
 *   post:
 *     tags: 
 *     - Lectures
 *     summary: Activate lecture access with 6-digit code (Admin only)
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
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Code]
 *             properties:
 *               Code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       '201':
 *         description: Lecture activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: |
 *           - Invalid CourseId/SectionID/LectureId format
 *           - Sorry Error while Activating Lecture
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: this ACtivation Code is Invalid
 *       '409':
 *         description: this User already enrolled in this Lecture
 */
lectureRouter.post("/Activate/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ActivateCodeValidation),
    lectureService.ActivateLecture)



/**
 * @openapi
 * /lectures/:LectureId:
 *   get:
 *     tags: 
 *     - Lectures
 *     summary: Get single lecture with viewer details (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture
 *     responses:
 *       '200':
 *         description: Lecture retrieved successfully
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
 *                     LectureName:
 *                       type: string
 *                     videoUrl:
 *                       type: string
 *                     CourseId:
 *                       type: string
 *                     SectionId:
 *                       type: string
 *                     viewedByUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullname:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           parentsPhone:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid LectureId format
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: No course found matching criteria
 */    
lectureRouter.get("/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.GetLecture)



/**
 * @openapi
 * /lectures/freeze/:LectureId:
 *   delete:
 *     tags: 
 *     - Lectures
 *     summary: Soft freeze lecture (sets DeletedAt) (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture (must be active)
 *     responses:
 *       '200':
 *         description: Lecture frozen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: |
 *           - Invalid LectureId format
 *           - sorry failed to freeze the lecture as it must be in IActive status
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 */
lectureRouter.delete("/freeze/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.FreezeLecture)


/**
 * @openapi
 * /lectures/:LectureId:
 *   delete:
 *     tags: 
 *     - Lectures
 *     summary: Hard delete lecture (must be frozen first) (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture (must have DeletedAt)
 *     responses:
 *       '200':
 *         description: Lecture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: |
 *           - Invalid LectureId format
 *           - sorry failed to Delete the lecture as it must be in IActive status
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 */
lectureRouter.delete("/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.DeleteLecture)




/**
 * @openapi
 * /lectures/Restore/:LectureId:
 *   patch:
 *     tags: 
 *     - Lectures
 *     summary: Restore frozen lecture (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture (must have DeletedAt)
 *     responses:
 *       '200':
 *         description: Lecture restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: |
 *           - Invalid LectureId format
 *           - sorry failed to Restore the lecture check if its already deleted
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 */
lectureRouter.patch("/Restore/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.RestoreLecture)



/**
 * @openapi
 * /lectures/GetLecturebyCourseName:
 *   get:
 *     tags: 
 *     - Lectures
 *     summary: Get all lectures by course name (Admin only)
 *     security:
 *     - bearerAuth: []
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
 *                 description: Exact course name
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Mathematics 101"
 *     responses:
 *       '200':
 *         description: Lectures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                       LectureName:
 *                         type: string
 *                         example: "Introduction to Algebra"
 *                       videoUrl:
 *                         type: string
 *                         example: "https://example.com/video.mp4"
 *                       CourseId:
 *                         type: string
 *                         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                       SectionId:
 *                         type: string
 *                         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                       viewedByUsers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             fullname:
 *                               type: string
 *                             phone:
 *                               type: string
 *                             parentsPhone:
 *                               type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       '400':
 *         description: Invalid course name format
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: No course found matching criteria
 */
lectureRouter.get("/GetLecturebyCourseName",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetLecturebyCourseNameValidation),
    lectureService.GetLecturebyCourseName)


/**
 * @openapi
 * /lectures/play/:LectureId:
 *   get:
 *     tags: 
 *     - Lectures
 *     summary: Mark lecture as viewed (requires enrollment check)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: LectureId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of lecture
 *     - in: query
 *       name: courseId
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of course (for enrollment check)
 *     responses:
 *       '200':
 *         description: Lecture marked as viewed successfully
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
 *                       example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                     LectureName:
 *                       type: string
 *                       example: "Introduction to Algebra"
 *                     videoUrl:
 *                       type: string
 *                       example: "https://example.com/video.mp4"
 *                     CourseId:
 *                       type: string
 *                     SectionId:
 *                       type: string
 *                     viewedByUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullname:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           parentsPhone:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: |
 *           - Invalid LectureId format
 *           - Invalid courseId format
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: No course found matching criteria
 *       '409':
 *         description: You are not enrolled in this Lecture or the Course
 */
lectureRouter.get("/play/:LectureId",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(LectureParamsValidation),
    lectureService.playlecture)


export default lectureRouter




