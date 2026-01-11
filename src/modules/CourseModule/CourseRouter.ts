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

CourseRouter.post("/",
    Authorization({ AcessRoles:[roleEnum.admin] }),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    validation(CreateCourseValidation), CourseService.createCourse)


CourseRouter.patch("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    validation(UpdateCourseValidation), CourseService.UpdateCourse)


CourseRouter.delete("/freeze/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.FreezeCourse)


CourseRouter.patch("/restore/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.RestoreCourse)

 
CourseRouter.delete("/Delete/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.DeleteCourse)


CourseRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(GetAllCoursesValidation),CourseService.GetAllCourses)


CourseRouter.get("/Archived",
        Authorization({ AcessRoles: [roleEnum.admin] }),
        validation(GetAllCoursesValidation),CourseService.GetAllCoursesArchived)


CourseRouter.get("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(checkCourseParam),CourseService.GetCourse)  


CourseRouter.get("/archived/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.GetCourseArchived) 
    


CourseRouter.post("/GenerateCode/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.GenerateCode) 



CourseRouter.patch("/activateCourse/:CourseId",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ActivateCodeValidation),CourseService.ActivateCourse) 


CourseRouter.patch("/AddStudent/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.addUser) 


export default CourseRouter