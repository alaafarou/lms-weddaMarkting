import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import ExamService from "./Exam.Service";
import { CreateExamValidation, ExamparamValidation } from "./Exam.validation";
import { DBSwitch } from "../middlwares/DB.middleware";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";



const ExamRouter = Router({mergeParams:true})


ExamRouter.post("/",
    DBSwitch,
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateExamValidation),
    localFileUpload({validation:fileValidation.image,folder:folderEnum.Courses}).single("image"),
    ExamService.CreateExam
)


ExamRouter.delete("/:ExamID",
    DBSwitch,
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.DeleteExame
)



ExamRouter.delete("/freeze/:ExamID",
    DBSwitch,
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.freezExame
)



ExamRouter.patch("/restore/:ExamID",
    DBSwitch,
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(ExamparamValidation),
    ExamService.restoreExame
)




ExamRouter.get("/:ExamID",
    DBSwitch,
    Authorization({AcessRoles:[roleEnum.user]}),
    validation(ExamparamValidation),
    ExamService.startExam
)


ExamRouter.patch("/submit/:ExamID",
    DBSwitch,
    Authorization({AcessRoles:[roleEnum.user]}),
    validation(ExamparamValidation),
    ExamService.submiteExame
)



export default ExamRouter