import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { ActivateCodeValidation, checkCourseParam, CreateCourseValidation, GetAllCoursesValidation, UpdateCourseValidation } from "./CourseValidaton";
import CourseService from "./CourseService";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import SectionRouter from "../SectionModule/Section.Router";


const CourseRouter = Router()

CourseRouter.use("/:CourseId/section",SectionRouter)



/**
 * @openapi
 * /courses/:
 *   post:
 *     tags: [Courses]
 *     summary: Create new course (Admin only and its BeareToken = System)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseBody'  
 *             encoding:
 *               image:
 *                 contentType: image/jpeg, image/png, image/webp
 *     responses:
 *       '201':
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "done" }
 *
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description:  'this Account is not created' }
 *       '409': { description:  'found another Course with that name ' }
 *  
 */
CourseRouter.post("/",
    Authorization({ AcessRoles:[roleEnum.admin] }),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    validation(CreateCourseValidation), CourseService.createCourse)


/**
 * @openapi
 * /courses/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: Updates Course (Admin only and its BeareToken = System)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of course to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdateBody'  
 *             encoding:
 *               image:
 *                 contentType: image/jpeg, image/png, image/webp
 *     responses:
 *       '200':
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "done" }
 *
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description:  'this Account is not created' }
 *       '409': { description:  'found another Course with that name ' }
 *  
 */
CourseRouter.patch("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    validation(UpdateCourseValidation), CourseService.UpdateCourse)


/**
 * @openapi
 * Courses/freeze/:CourseId:
 *   delete:
 *     tags: [Courses]
 *     summary: freeze Course (Admin only - System Bearer Token)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of course to update
 *     responses:
 *       '200':
 *         description: Course freezed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Course updated successfully" }
 *       '400':
 *         description: Bad Request - failed to freeze Course
 *       '401':
 *         description: Unauthorized - Invalid/missing token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course not found
 */
CourseRouter.delete("/freeze/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.FreezeCourse)




/**
 * @openapi
 * Courses/restore/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: restore Course (Admin only - System Bearer Token)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of course to update
 *     responses:
 *       '200':
 *         description: Course freezed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Course updated successfully" }
 *       '400':
 *         description: Bad Request - failed to restore Course
 *       '401':
 *         description: Unauthorized - Invalid/missing token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course not found
 */
CourseRouter.patch("/restore/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.RestoreCourse)

 

/**
 * @openapi
 * Courses/:CourseId:
 *   delete:
 *     tags: [Courses]
 *     summary: delete Course (Admin only - System Bearer Token)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of course to update
 *     responses:
 *       '200':
 *         description: Course freezed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Course updated successfully" }
 *       '400':
 *         description: Bad Request - failed to delete Course
 *       '401':
 *         description: Unauthorized - Invalid/missing token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course not found
 */
CourseRouter.delete("/Delete/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.DeleteCourse)




/**
 * @openapi
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses with optional filters (Admin  and its BeareToken = System and User and its BearerToken=Bearer)
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           example: 1
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: number
 *           example: 10
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetAllCoursesBody'
 *     responses:
 *       '200':
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: number }
 *                     page: { type: number }
 *                     size: { type: number }
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description: 'current Account is not created - No courses found matching criteria' }
 */
CourseRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(GetAllCoursesValidation),CourseService.GetAllCourses)





/**
 * @openapi
 * /courses/Archived:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses Archived with filters (Admin  and its BeareToken = System and User and its BearerToken=Bearer)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           example: 1
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: number
 *           example: 10
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetAllCoursesBody'
 *     responses:
 *       '200':
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: number }
 *                     page: { type: number }
 *                     size: { type: number }
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description: 'current Account is not created - no Courses can be Found' }
 *  
 */    
CourseRouter.get("/Archived",
        Authorization({ AcessRoles: [roleEnum.admin] }),
        validation(GetAllCoursesValidation),CourseService.GetAllCoursesArchived)



/**
 * @openapi
 * /courses/:CourseId:
 *   get:
 *     tags: [Courses]
 *     summary: get Course by id (Admin  and its BeareToken = System and User and its BearerToken=Bearer)
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of course to update
 *     responses:
 *       '200':
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "done" }
 *
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description:  'this Account is not created or this course is not created ' }
 */
CourseRouter.get("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(checkCourseParam),CourseService.GetCourse)  



/**
 * @openapi
 * /courses/archived/:CourseId:
 *   get:
 *     tags: [Courses]
 *     summary: get Course archived by id (Admin  and its BeareToken = System)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of course to update
 *     responses:
 *       '200':
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "done" }
 *
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description:  'this Account is not created or this course is not created ' }
 */
CourseRouter.get("/archived/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.GetCourseArchived) 
    

/**
 * @openapi
 * /courses/GenerateCode/:/CourseId:
 *   post:
 *     tags: [Courses]
 *     summary: Generate enrollment code for course-student pair (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Valid MongoDB ObjectId of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               StudentID:
 *                 type: string
 *                 example: "507f191e810c19729de860ea"
 *                 description: Valid MongoDB ObjectId of the student
 *             required: [StudentID]
 *             additionalProperties: false
 *     responses:
 *       '201':
 *         description: Enrollment code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Enrollment code generated" }
 *       '400':
 *         description: Invalid CourseId or StudentID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid Course ID format" }
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course or Student not found
 *       '409':
 *         description: Enrollment code already exists for this pair
 */   
CourseRouter.post("/GenerateCode/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.GenerateCode) 


/**
 * @openapi
 * /courses/activateCourse/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: Activate course enrollment using 6-digit OTP code (User only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Valid MongoDB ObjectId of the course to activate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Code:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *                 description: 6-digit numeric OTP code
 *             required: [Code]
 *             additionalProperties: false
 *     responses:
 *       '200':
 *         description: Course activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Course activated successfully" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseId: { type: string, example: "507f1f77bcf86cd799439011" }
 *                     studentId: { type: string, example: "507f191e810c19729de860ea" }
 *                     activatedAt: { type: string, format: date-time }
 *       '400':
 *         description: Invalid OTP format (must be exactly 6 digits)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "OTP must be exactly 6 digits" }
 *       '401':
 *         description: Unauthorized - invalid user token  or this user cant use this otp
 *       '404':
 *         description: Course not found or code expired/invalid
 *       '409':
 *         description: Course already activated for this user
 * 
 */
CourseRouter.patch("/activateCourse/:CourseId",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ActivateCodeValidation),CourseService.ActivateCourse) 

/**
 * @openapi
 * /courses/AddStudent/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: Add student to Course Manually  (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Valid MongoDB ObjectId of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               StudentID:
 *                 type: string
 *                 example: "507f191e810c19729de860ea"
 *                 description: Valid MongoDB ObjectId of the student
 *             required: [StudentID]
 *             additionalProperties: false
 *     responses:
 *       '201':
 *         description: Enrollment code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Enrollment code generated" }
 *       '400':
 *         description: Invalid CourseId or StudentID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid Course ID format" }
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course or Student not found
 *       '409':
 *         description: Enrollment code already exists for this pair
 */ 
CourseRouter.patch("/AddStudent/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.addUser) 



/**
 * @openapi
 * /courses/AddStudent/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: Remove student from Course Manually  (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: Valid MongoDB ObjectId of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               StudentID:
 *                 type: string
 *                 example: "507f191e810c19729de860ea"
 *                 description: Valid MongoDB ObjectId of the student
 *             required: [StudentID]
 *             additionalProperties: false
 *     responses:
 *       '201':
 *         description: Enrollment code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Enrollment code generated" }
 *       '400':
 *         description: Invalid CourseId or StudentID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid Course ID format" }
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: Course or Student not found
 *       '409':
 *         description: Enrollment code already exists for this pair
 */ 
CourseRouter.patch("/RemoveStudent/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.DeleteStudent) 



export default CourseRouter