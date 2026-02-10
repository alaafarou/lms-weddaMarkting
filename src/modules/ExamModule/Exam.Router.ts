import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import ExamService from "./Exam.Service";
import { AddQuestionValidation, CreateExamValidation, DeleteExamValidation, ExamparamValidation, UpdateExamValidation } from "./Exam.validation";
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer";



const ExamRouter = Router({ mergeParams: true })


ExamRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Exam }).array("images"),
    ExamService.FlatenQuestions,
    validation(CreateExamValidation),
    ExamService.CreateExam
)


ExamRouter.get("/:ExamID", 
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.GetExam
)
 
ExamRouter.patch("/:ExamID", 
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(UpdateExamValidation),
    ExamService.UpdateExam
)

ExamRouter.delete("/:ExamID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.DeleteExame
)


ExamRouter.post("/:ExamID",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ExamparamValidation),
    ExamService.startExam
)


ExamRouter.post("/:ExamID/AddQuestion",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Exam }).single("image"),
    validation(AddQuestionValidation),
    ExamService.AddQuestions
)

ExamRouter.delete("/DeleteQuestion/:QuestionID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(DeleteExamValidation),
    ExamService.DeleteQuestion
)


ExamRouter.delete("/freeze/:ExamID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.freezExame
)


ExamRouter.patch("/restore/:ExamID",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(ExamparamValidation),
    ExamService.restoreExame
)


ExamRouter.patch("/submit/:ExamID",
    Authorization({ AcessRoles: [roleEnum.user] }),
    validation(ExamparamValidation),
    ExamService.submiteExame
)



export default ExamRouter