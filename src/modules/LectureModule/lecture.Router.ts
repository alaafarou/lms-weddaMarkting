import { Router } from "express"
import { Authorization } from "../middlwares/Authentication.middleware"
import { roleEnum } from "../../Schema/UserModel"
import lectureService from "./lecture.Service"
import { ActivateCodeValidation, createLectureValidation, LectureParamsValidation, UpdatelectureValidation } from "./Lecture.validation"
import { validation } from "../middlwares/validation.middleware"


const lectureRouter = Router({ mergeParams: true })


lectureRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(createLectureValidation),
    lectureService.createlecture)

    
lectureRouter.patch("/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(UpdatelectureValidation),
    lectureService.Updatelecture)



lectureRouter.post("/Activate/:LectureId",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ActivateCodeValidation),
    lectureService.ActivateLecture)



lectureRouter.get("/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.GetLecture)



lectureRouter.delete("/freeze/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.FreezeLecture)


lectureRouter.delete("/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.DeleteLecture)



lectureRouter.patch("/Restore/:LectureId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(LectureParamsValidation),
    lectureService.RestoreLecture)


lectureRouter.get("/play/:LectureId",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(LectureParamsValidation),
    lectureService.playlecture)


export default lectureRouter




