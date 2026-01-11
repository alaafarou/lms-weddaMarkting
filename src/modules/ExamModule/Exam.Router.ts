import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import ExamService from "./Exam.Service";
import { CreateExamValidation, ExamparamValidation } from "./Exam.validation";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";



const ExamRouter = Router({mergeParams:true})


ExamRouter.post("/",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateExamValidation),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    ExamService.CreateExam
)


ExamRouter.delete("/:ExamID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.DeleteExame
)



ExamRouter.delete("/freeze/:ExamID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.freezExame
)



ExamRouter.patch("/restore/:ExamID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.restoreExame
)




ExamRouter.get("/:ExamID",
    Authorization({AcessRoles:[roleEnum.user]}),
    validation(ExamparamValidation),
    ExamService.startExam
)


ExamRouter.patch("/submit/:ExamID",
    Authorization({AcessRoles:[roleEnum.user]}),
    validation(ExamparamValidation),
    ExamService.submiteExame
)



export default ExamRouter