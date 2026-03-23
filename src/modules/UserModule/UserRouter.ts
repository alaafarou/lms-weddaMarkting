import { Router } from "express";
import UserService from "./UserService";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import { AddStudentValidation, DeleteUserValidation, freezeUserValidation, GetAllUsersValidation, ISEnrollendValidation, ProfileValidation, restoreUserValidation, updateProfileValidation } from "./Uservalidation";
import { TokenEnum } from "../Utilis/Security/security";

const UserRouter = Router()





UserRouter.post("/AddStudent",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(AddStudentValidation),
    UserService.AddStudent)

UserRouter.get("/students",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllUsersValidation),
    UserService.GetAllUsers
)

UserRouter.post("/logout",
    // validation(logoutValidation),
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    UserService.logout)

// UserRouter.patch("/updatepassword",
//     validation(updatepasswordValidaton),
//     Authorization({ AcessRoles: [roleEnum.user] }),
//     UserService.updatepassword)


UserRouter.get("/Acesstoken", Authorization({
    AcessRoles: [roleEnum.admin, roleEnum.user],
    TokenType: TokenEnum.RefreshToken
}), UserService.GetAccessToken)


UserRouter.get("/admins",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.GetAllAdmins
)



UserRouter.get("/MyCourses",
    Authorization({ AcessRoles: [roleEnum.user] }),
    UserService.MyCourses)


UserRouter.patch("/profile-image",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({
        folder: folderEnum.User,
        validation: fileValidation.image,
    }).single("image"),
    UserService.updateprofileimage)




UserRouter.get("/:UserId",
    validation(ProfileValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.profile)


UserRouter.patch("/:UserId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(updateProfileValidation),
    UserService.UpdateProfile)


UserRouter.delete("/freezeUser/:UserId",
    validation(freezeUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.freezeUser)


UserRouter.delete("/DeleteUser/:UserId",
    validation(DeleteUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.DeleteUser)


UserRouter.patch("/restoreUser/:UserId",
    validation(restoreUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.RestoreUser)



UserRouter.get("/ISEnrollend/:CourseId",
    validation(ISEnrollendValidation),
    Authorization({ AcessRoles: [roleEnum.user] }),
    UserService.ISEnrollend)


UserRouter.post("/Acesstoken",
    Authorization({
        AcessRoles: [roleEnum.admin, roleEnum.user],
        TokenType: TokenEnum.RefreshToken
    }), 
    UserService.GetAccessToken)




export default UserRouter


