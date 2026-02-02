import { Router } from "express";
import UserService from "./UserService";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import { Authorization } from "../middlwares/Authentication.middleware";
import { endpoints } from "./user.endpoint";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import { DeleteUserValidation, freezeUserValidation, GetAllUsersValidation, logoutValidation, restoreUserValidation, updatepasswordValidaton } from "./Uservalidation";
import { TokenEnum } from "../Utilis/Security/security";

const UserRouter = Router()

/**
 * @openapi
 * /users/profile-image:
 *   patch:
 *     tags: 
 *     - Users
 *     summary: Update user profile image (User role)
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPG, PNG)
 *     responses:
 *       '200':
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     ImagePath:
 *                       type: string
 *                       example: "/uploads/users/abc123.jpg"
 *                     User:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         profileimage:
 *                           type: string
 *                         fullname:
 *                           type: string
 *                         email:
 *                           type: string
 *       '400':
 *         description: |
 *           - Invalid image file
 *           - failed to update profile image
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - User role required
 */
UserRouter.patch("/profile-image",
    Authorization({ AcessRoles: endpoints.profileimage }),
    localFileUpload({
        folder: folderEnum.User,
        validation: fileValidation.image,
    }).single("image"),
    UserService.updateprofileimage)


/**
 * @openapi
 * /users:
 *   get:
 *     tags: 
 *     - Users
 *     summary: Get current user profile (User/Admin)
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
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
 *                         profileImage:
 *                           type: string
 *                         parentsPhone:
 *                           type: string
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - User/Admin role required
 */
UserRouter.get("",
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    UserService.profile)

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

UserRouter.get("MyCourses",
    Authorization({ AcessRoles: [roleEnum.user] }),
    UserService.MyCourses)


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
UserRouter.get("/Acesstoken",Authorization({
    AcessRoles: [roleEnum.admin, roleEnum.user],
    TokenType:TokenEnum.RefreshToken
}),UserService.GetAccessToken)


/**
 * @openapi
 * /users/freezeUser/:UserId:
 *   patch:
 *     tags: 
 *     - Users
 *     summary: Soft freeze user account + related data (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: UserId
 *       required: false
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of user to freeze (omit to self-freeze)
 *     responses:
 *       '200':
 *         description: User frozen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   enum: ["Admin deleted self successfully", "User Freezed successfully"]
 *       '400':
 *         description: |
 *           - sorry Errore while Deleting admin acount
 *           - sorry cannot delete admin account
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: User not found or already deleted
 */

UserRouter.patch("/freezeUser{/:id}",
    validation(freezeUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.freezeUser)





/**
 * @openapi
 * /users/DeleteUser/:UserId:
 *   patch:
 *     tags: 
 *     - Users
 *     summary: Hard delete frozen user + related data (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: UserId
 *       required: false
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of frozen user (omit to self-delete)
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   example: "User restored successfully"
 *       '400':
 *         description: |
 *           - sorry Errore while Deleting admin acount
 *           - sorry we cant delet admin User
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: |
 *           - sorry this user cant be found as it may be already deleted
 *           - User not found or already restored
 */
UserRouter.patch("/DeleteUser{/:id}",
    validation(DeleteUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.DeleteUser)



 /**
 * @openapi
 * /users/restoreUser/:UserId:
 *   patch:
 *     tags: 
 *     - Users
 *     summary: Restore frozen user + Enrollment/Submission (Admin only)
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: UserId
 *       required: false
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of frozen user (omit to self-restore)
 *     responses:
 *       '200':
 *         description: User restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   enum: ["Admin account restored successfully", "User restored successfully"]
 *       '400':
 *         description: |
 *           - sorry Errore while restoring admin acount
 *           - sorry cannot restore admin account
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Admin role required
 *       '404':
 *         description: User not found or already restored
 */
UserRouter.patch("/restoreUser{/:id}",
    validation(restoreUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.RestoreUser)


UserRouter.get("/users",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllUsersValidation),
    UserService.GetAllAdmins
)




    

export default UserRouter


