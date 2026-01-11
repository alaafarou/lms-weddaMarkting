import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { ActivateCodeValidation, checkCourseParam, CreateCourseValidation, GetAllCoursesValidation, UpdateCourseValidation } from "./CourseValidaton";
import CourseService from "./CourseService";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import SectionRouter from "../SectionModule/Section.Router";
import { DBSwitch } from "../middlwares/DB.middleware";


const CourseRouter = Router()

CourseRouter.use("/:CourseId/section",SectionRouter)

CourseRouter.post("/",
    DBSwitch,
    Authorization({ AcessRoles:[roleEnum.admin] }),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    validation(CreateCourseValidation), CourseService.createCourse)


CourseRouter.patch("/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    validation(UpdateCourseValidation), CourseService.UpdateCourse)


CourseRouter.delete("/freeze/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.FreezeCourse)


CourseRouter.patch("/restore/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.RestoreCourse)

 
CourseRouter.delete("/Delete/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.DeleteCourse)


CourseRouter.get("/",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(GetAllCoursesValidation),CourseService.GetAllCourses)


CourseRouter.get("/Archived",
        DBSwitch,
        Authorization({ AcessRoles: [roleEnum.admin] }),
        validation(GetAllCoursesValidation),CourseService.GetAllCoursesArchived)


CourseRouter.get("/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(checkCourseParam),CourseService.GetCourse)  


CourseRouter.get("/archived/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.GetCourseArchived) 
    


CourseRouter.post("/GenerateCode/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.GenerateCode) 



CourseRouter.patch("/activateCourse/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ActivateCodeValidation),CourseService.ActivateCourse) 


CourseRouter.patch("/AddStudent/:CourseId",
    DBSwitch,
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam),CourseService.addUser) 


export default CourseRouter