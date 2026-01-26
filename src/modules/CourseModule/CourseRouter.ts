import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { ActivateCodeValidation, checkCourseParam, CreateCourseValidation, GenerateCodeValidation, GetAllCoursesValidation, getCoursestudentsValidation, getcourseValidation, UpdateCourseValidation } from "./CourseValidaton";
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
 *     summary: Create new course (Admin only and its BearerToken = System)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseBody'
 *           encoding:
 *             image:
 *               contentType: image/jpeg, image/png, image/webp
 *     responses:
 *       '201':
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/CreateCourseBody'
 *       '400':
 *         description: missing authorization header - invalid image type or failed to create this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: this Account is not created
 *       '409':
 *         description: found another Course with that name - this course with this name already created
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
 *     summary: Updates Course (Admin only and its BearerToken = System)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of course to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdateBody'
 *           encoding:
 *             image:
 *               contentType: image/jpeg, image/png, image/webp
 *     responses:
 *       '200':
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/CourseUpdateBody'
 *       '400':
 *         description: missing authorization header - invalid image type or sorry failed to update course please try again later
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: this Account is not created or Course not found
 *       '409':
 *         description: found another Course with that name - therename already used
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
 *     summary: Get all courses with optional filters (Admin and User)
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     Courses:
 *                       type: object
 *                       properties:
 *                         pages:
 *                           type: number
 *                         countdoc:
 *                           type: number
 *                         result:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/GetAllCoursesBody'
 *                         currentpage:
 *                           type: number
 *                         size:
 *                           type: number
 *       '400':
 *         description: missing authorization header - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin or User role required
 *       '404':
 *         description: current Account is not created - No courses found matching criteria
 */
CourseRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(GetAllCoursesValidation),CourseService.GetAllCourses)


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
 *                 data:
 *                   $ref: '#/components/schemas/CreateCourseBody'
 *       '400': { description:  missing authorization header - invalide image type ' }
 *       '401': { description: 'Unauthorized - Invalid token' }
 *       '403': { description: 'Forbidden - Admin role required' }
 *       '404': { description:  'this Account is not created or this course is not created ' }
 */
CourseRouter.get("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(getcourseValidation),CourseService.GetCourse)  

/**
 * @openapi
 * /courses/students/:CourseId:
 *   get:
 *     tags: [Courses]
 *     summary: Get course students with optional user filters (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of course
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
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: "John"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       '200':
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     pages:
 *                       type: number
 *                     countdoc:
 *                       type: number
 *                     result:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           courseId:
 *                             type: string
 *                           UserId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               fullname:
 *                                 type: string
 *                               lastname:
 *                                 type: string
 *                               firstname:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                           CreatedAt:
 *                             type: string
 *                             format: date-time
 *                           LectureId:
 *                             type: string
 *                           UpdatedAt:
 *                             type: string
 *                             format: date-time
 *                           UpdatedBy:
 *                             type: string
 *                           DeletedAt:
 *                             type: string
 *                             format: date-time
 *                           DeletedBy:
 *                             type: string
 *                     currentpage:
 *                       type: number
 *                     size:
 *                       type: number
 *       '400':
 *         description: Invalid Course ID format or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: No course found matching criteria
 */
CourseRouter.get("/students/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(getCoursestudentsValidation),CourseService.GetCourseStudents)  


/**
 * @openapi
 * /courses/activateCourse/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: Activate course with OTP code (User only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of course
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
 *                 description: 6-digit activation code
 *     responses:
 *       '200':
 *         description: Course activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: Invalid Course ID format or Sorry Error while Activating Course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - User role required
 *       '404':
 *         description: this Account is not created or this ACtivation Code is Invalid
 *       '409':
 *         description: this User already enrolled in this Course
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
 * /courses/RemoveStudent/:CourseId:
 *   patch:
 *     tags: [Courses]
 *     summary: Remove student from course (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CourseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [StudentID]
 *             properties:
 *               StudentID:
 *                 type: string
 *                 description: MongoDB ObjectId of student user
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Student removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: Invalid Student ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: sorry cant Delete Student as its Already didnt Enrolle in this Course
 */
CourseRouter.patch("/RemoveStudent/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.DeleteStudent) 

/**
 * @openapi
 * /courses/Grade_Semester_Course:
 *   get:
 *     tags: [Courses]
 *     summary: Get active courses by grade level and semester (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               GradeLevel:
 *                 type: string
 *                 enum: [KG1, KG2, Grade1, Grade2, Grade3, Grade4, Grade5, Grade6, Grade7, Grade8, Grade9, Grade10, Grade11, Grade12]
 *                 example: "Grade1"
 *               Semester:
 *                 type: string
 *                 enum: [First, Second]
 *                 example: "First"
 *     responses:
 *       '200':
 *         description: Courses retrieved successfully
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
 *                       name:
 *                         type: string
 *                         example: "Mathematics Grade 1"
 *       '400':
 *         description: Invalid Grade Level or Semester
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 */
 CourseRouter.get("/Grade_Semester_Course",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.Grade_Semester_Course) 




export default CourseRouter