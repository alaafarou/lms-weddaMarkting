import { Router } from "express";
import UserService from "./UserService";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import { Authorization } from "../middlwares/Authentication.middleware";
import { endpoints } from "./user.endpoint";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import { DeleteUserValidation, freezeUserValidation, logoutValidation, restoreUserValidation } from "./Uservalidation";

const UserRouter = Router()


UserRouter.patch("/profile-image",
    Authorization({ AcessRoles: endpoints.profileimage }),
    localFileUpload({
        folder: folderEnum.User,
        validation: fileValidation.image,
    }).single("image"),
    UserService.updateprofileimage)


UserRouter.get("",
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    UserService.profile)


UserRouter.post("/logout",
    validation(logoutValidation),
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    UserService.logout)


UserRouter.patch("/freezeUser{/:id}",
    validation(freezeUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.freezeUser)

// UserRouter.patch("/change-role{/:id}",
//     Authorization({ AcessRoles: [roleEnum.admin] }),
//     validation(changeroleValidation),
//     UserService.changerole)


UserRouter.patch("/DeleteUser{/:id}",
    validation(DeleteUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.DeleteUser)


UserRouter.patch("/restoreUser{/:id}",
    validation(restoreUserValidation),
    Authorization({ AcessRoles: [roleEnum.admin] }),
    UserService.RestoreUser)

export default UserRouter


