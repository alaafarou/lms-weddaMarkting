import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { ActivateCodeValidation, AddStudentValidation, checkCourseParam, CourseParamValidation, CreateCourseValidation, GetAllCoursesValidation, getCoursestudentsValidation, getcourseValidation, Grade_Semester_CourseValidation, UpdateCourseValidation } from "./CourseValidaton";
import CourseService from "./CourseService";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";
import SectionRouter from "../SectionModule/Section.Router";


const CourseRouter = Router()

CourseRouter.use("/:CourseId/section", SectionRouter)

CourseRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Courses }).single("image"),
    validation(CreateCourseValidation), CourseService.createCourse)


CourseRouter.get("/",
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    validation(GetAllCoursesValidation), CourseService.GetAllCourses)


CourseRouter.get("/Grade-Semester-Course",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(Grade_Semester_CourseValidation), CourseService.Grade_Semester_Course)


CourseRouter.patch("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Courses }).single("image"),
    validation(UpdateCourseValidation), CourseService.UpdateCourse)


CourseRouter.get("/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin, roleEnum.user] }),
    validation(getcourseValidation), CourseService.GetCourse)


CourseRouter.get("/students/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(getCoursestudentsValidation), CourseService.GetCourseStudents)


CourseRouter.patch("/activateCourse/:CourseId",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ActivateCodeValidation), CourseService.ActivateCourse)



CourseRouter.post("/AddStudent/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(AddStudentValidation), CourseService.addUser)



CourseRouter.delete("/RemoveStudent/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(checkCourseParam), CourseService.DeleteStudent)





CourseRouter.delete("/freeze/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(CourseParamValidation), CourseService.FreezeCourse)



CourseRouter.patch("/restore/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(CourseParamValidation), CourseService.RestoreCourse)


CourseRouter.delete("/Delete/:CourseId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(CourseParamValidation), CourseService.DeleteCourse)


export default CourseRouter