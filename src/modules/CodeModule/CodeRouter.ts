import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import CodeService from "./CodeService";
import { GeneratePrivateCodeValidation, GeneratePublicCodeValidation, GetAllCodesLecturesValidation, GetAllGeneralCodesValidation, GetAllPrivateCodesValidation } from "./CodeValidation";


const CodeRouter = Router()



/**
 * @openapi
 * /codes/:
 *   post:
 *     tags: [Codes]
 *     summary: Generate multiple private codes for course or lecture (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number]
 *             properties:
 *               number:
 *                 type: number
 *                 minimum: 1
 *                 example: 10
 *               name:
 *                 type: string
 *                 example: "Mathematics Grade 1"
 *               LectureName:
 *                 type: string
 *                 example: "Chapter 1"
 *     responses:
 *       '201':
 *         description: Private codes generated successfully
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
 *                       Code:
 *                         type: string
 *                         example: "123456"
 *                       CourseId:
 *                         type: string
 *                       lectureId:
 *                         type: string
 *       '400':
 *         description: failed to generate code
 *       '409':
 *         description: Cannot provide both Course name and Lecture name or must provide one
 */
CodeRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GeneratePrivateCodeValidation),CodeService.GeneratePrivateCode) 

/**
 * @openapi
 * /codes/General:
 *   post:
 *     tags: 
 *     - Codes
 *     summary: Generate single public code for course or lecture (Admin only)
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mathematics Grade 1"
 *                 description: Course name (cannot use with LectureName)
 *               LectureName:
 *                 type: string
 *                 example: "Chapter 1"
 *                 description: Lecture name (cannot use with name)
 *     responses:
 *       '201':
 *         description: Public code generated successfully
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
 *                       Code:
 *                         type: string
 *                         example: "123456"
 *                       CodeType:
 *                         type: string
 *                         example: "General"
 *                       CourseId:
 *                         type: string
 *                       lectureId:
 *                         type: string
 *       '400':
 *         description: failed to generate code
 *       '409':
 *         description: |
 *           - please confirm Do yount Code for Course or for Lecture
 *           - there is already public Code Generatied for this Course
 *           - there is already public Code Generatied for this Lecture
 *       '404':
 *         description: Course or Lecture not found
 */
CodeRouter.post("/General",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GeneratePublicCodeValidation),CodeService.GeneratePublicCode) 


/**
 * @openapi
 * /codes/:
 *   get:
 *     tags: 
 *       - Codes
 *     summary: Get all private codes with advanced filters (Admin only)
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
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               name:
 *                 type: string
 *               Code:
 *                 type: string
 *               GradeLevel:
 *                 type: string
 *               Semester:
 *                 type: string
 *               CodeStatus:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Private codes retrieved successfully
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
 *                     currentpage:
 *                       type: number
 *                     size:
 *                       type: number
 *       '400':
 *         description: validation error
 *       '401':
 *         description: Unauthorized - Invalid token
 */
CodeRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllPrivateCodesValidation),CodeService.GetAllPrivateCodes) 



/**
 * @openapi
 * /codes/General:
 *   get:
 *     tags: 
 *     - Codes
 *     summary: Get all general codes with course filters (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: query
 *       name: page
 *       required: false
 *       schema:
 *         type: number
 *         example: 1
 *     - in: query
 *       name: size
 *       required: false
 *       schema:
 *         type: number
 *         example: 10
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               GradeLevel:
 *                 type: string
 *               Semester:
 *                 type: string
 *               Code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       '200':
 *         description: General codes retrieved successfully
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
 *                           Code:
 *                             type: string
 *                           CourseId:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               GradeLevel:
 *                                 type: string
 *                               Semester:
 *                                 type: string
 *                     currentpage:
 *                       type: number
 *                     size:
 *                       type: number
 *       '400':
 *         description: validation error
 *       '401':
 *         description: Unauthorized - Invalid token
 */
CodeRouter.get("/General",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllGeneralCodesValidation),CodeService.GetAllGeneralCodes) 



/**
 * @openapi
 * /codes/CodeLectures:
 *   get:
 *     tags: 
 *     - Codes
 *     summary: Get all lecture codes with filters (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: query
 *       name: page
 *       required: false
 *       schema:
 *         type: number
 *         example: 1
 *     - in: query
 *       name: size
 *       required: false
 *       schema:
 *         type: number
 *         example: 10
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               LectureName:
 *                 type: string
 *               Code:
 *                 type: string
 *               CodeStatus:
 *                 type: string
 *                 enum: [Unused, Used]
 *               CodeType:
 *                 type: string
 *                 enum: [Private, General]
 *                 default: "Private"
 *     responses:
 *       '200':
 *         description: Lecture codes retrieved successfully
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
 *                           Code:
 *                             type: string
 *                           Usedby:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                               fullname:
 *                                 type: string
 *                           LectureId:
 *                             type: object
 *                             properties:
 *                               LectureName:
 *                                 type: string
 *                     currentpage:
 *                       type: number
 *                     size:
 *                       type: number
 *       '400':
 *         description: validation error
 *       '401':
 *         description: Unauthorized - Invalid token
 */
CodeRouter.get("/CodeLectures",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllCodesLecturesValidation),CodeService.GetAllCodesLecture) 



export default  CodeRouter 
