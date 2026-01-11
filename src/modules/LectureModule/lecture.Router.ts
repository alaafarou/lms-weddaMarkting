import { Router } from "express"
import { Authorization } from "../middlwares/Authentication.middleware"
import { roleEnum } from "../../Schema/UserModel"
import lectureService from "./lecture.Service"
import { createLectureValidation } from "./Lecture.validation"
import { validation } from "../middlwares/validation.middleware"


const lectureRouter = Router({ mergeParams: true })


lectureRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(createLectureValidation),
    lectureService.createleacture)
    

lectureRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(createLectureValidation),
    lectureService.createleacture)


lectureRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(createLectureValidation),
    lectureService.createleacture)


lectureRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(createLectureValidation),
    lectureService.createleacture)


export default lectureRouter