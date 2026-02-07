import { Router } from "express";
import { validation } from "../middlwares/validation.middleware";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import CodeService from "./CodeService";
import { Codeparamsvalidation, GeneratePrivateCodeValidation, GeneratePublicCodeValidation, GetAllCodesLecturesValidation, GetAllGeneralCodesValidation, GetAllPrivateCodesValidation, GetLecturebyCourseNameValidation, Grade_Semester_CourseValidation } from "./CodeValidation";


const CodeRouter = Router()


CodeRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GeneratePrivateCodeValidation), 
    CodeService.GeneratePrivateCode)

 
CodeRouter.post("/General",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GeneratePublicCodeValidation), CodeService.GeneratePublicCode)


CodeRouter.get("/all-Course-private-code",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllPrivateCodesValidation), CodeService.GetAllPrivateCodes)



CodeRouter.get("/all-Course-General-code",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllGeneralCodesValidation), 
    CodeService.GetAllGeneralCodes)



CodeRouter.get("/lecture-codes",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetAllCodesLecturesValidation),
    CodeService.GetAllCodesLecture)


CodeRouter.delete("/GeneralCode/:Codeid",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(Codeparamsvalidation),
    CodeService.DeletGeneralCode
)


CodeRouter.get("/GetLecturebyCourseName",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(GetLecturebyCourseNameValidation),
    CodeService.GetLecturebyCourseName
)


CodeRouter.get("/Grade-Semester-Course",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(Grade_Semester_CourseValidation),
    CodeService.Grade_Semester_Course
)


export default CodeRouter 
