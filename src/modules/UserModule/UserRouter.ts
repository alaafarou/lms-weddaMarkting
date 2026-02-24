import { Router } from "express";
import UserService from "./UserService";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import { DeleteUserValidation, freezeUserValidation, GetAllUsersValidation, ISEnrollendValidation, logoutValidation, ProfileValidation, restoreUserValidation, updatepasswordValidaton, updateProfileValidation } from "./Uservalidation";
import { TokenEnum } from "../Utilis/Security/security";

const UserRouter = Router()


UserRouter.get("/:UserId",
    validation(ProfileValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.profile)


UserRouter.patch("/:UserId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(updateProfileValidation),
    UserService.UpdateProfile)


UserRouter.patch("/profile-image",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({
        folder: folderEnum.User,
        validation: fileValidation.image,
    }).single("image"),
    UserService.updateprofileimage)




UserRouter.patch("/freezeUser/:UserId}",
    validation(freezeUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.freezeUser)


UserRouter.patch("/DeleteUser/:UserId}",
    validation(DeleteUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.DeleteUser)


UserRouter.patch("/restoreUser/:id}",
    validation(restoreUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.RestoreUser)


/**
 * @openapi
 * /users/MyCourses:
 *   get:
 *     tags: 
 *     - Users
 *     summary: Get courses enrolled by current user (Student only)
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User enrolled courses retrieved successfully
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
 *                       courseId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                       UserId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - User role required
 */
UserRouter.get("/MyCourses",
    Authorization({ AcessRoles: [roleEnum.user] }),
    UserService.MyCourses)


UserRouter.get("/ISEnrollend/:CourseId",
    validation(ISEnrollendValidation),
    Authorization({ AcessRoles: [roleEnum.user] }),
    UserService.ISEnrollend)
/**
 * @openapi
 * /users/logout:
 *   post:
 *     tags: 
 *     - Users
 *     summary: Logout current user (User/Admin)
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       '200':
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "done"
 *       '400':
 *         description: Invalid refresh token format
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - User/Admin role required
 */
UserRouter.post("/logout",
    validation(logoutValidation),
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    UserService.logout)


/**
 * @openapi
 * /users/updatepassword:
 *   patch:
 *     tags: 
 *     - Users
 *     summary: Update user password with logout options (User only)
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, newpassword, flag]
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password
 *                 minLength: 6
 *                 example: "oldpass123"
 *               newpassword:
 *                 type: string
 *                 description: New password
 *                 minLength: 6
 *                 example: "newpass456"
 *               flag:
 *                 type: string
 *                 enum: [AllDevices, CurrentDevice]
 *                 description: |
 *                   - AllDevices: Logout from all devices (sets changeCredentialsTime)
 *                   - CurrentDevice: Logout current session only (createRevokeToken)
 *                 example: "AllDevices"
 *     responses:
 *       '200':
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullname:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         changeCredentialsTime:
 *                           type: string
 *                           format: date-time
 *                           description: Set when flag=AllDevices
 *       '400':
 *         description: |
 *           - Invalid input format
 *           - this password is wrong
 *           - failed to update the user
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - User role required
 */
UserRouter.patch("/updatepassword",
    validation(updatepasswordValidaton),
    Authorization({ AcessRoles: [roleEnum.user] }),
    UserService.updatepassword)


/**
 * @openapi
 * /users/Acesstoken:
 *   get:
 *     tags: 
 *     - Users
 *     summary: Generate new access token using refresh token (User/Admin)
 *     security:
 *     - bearerAuth: [RefreshToken]
 *     responses:
 *       '200':
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       '401':
 *         description: Unauthorized - Invalid refresh token
 *       '403':
 *         description: Forbidden - User/Admin role required
 *       '404':
 *         description: User not found
 */
UserRouter.get("/Acesstoken", Authorization({
    AcessRoles: [roleEnum.admin, roleEnum.user],
    TokenType: TokenEnum.RefreshToken
}), UserService.GetAccessToken)






UserRouter.get("/admins",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.GetAllAdmins
)


UserRouter.get("/students",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllUsersValidation),
    UserService.GetAllUsers
)






export default UserRouter


