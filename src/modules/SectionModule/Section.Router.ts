import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import SectionService from "./Section.Service";
import { CreateSectionValidation } from "./Section.validation";
import lectureRouter from "../LectureModule/lecture.Router";
import ExamRouter from "../ExamModule/Exam.Router";

export const SectionRouter = Router({mergeParams:true})

SectionRouter.use("/:SectionID/lecture",lectureRouter)
SectionRouter.use("/:SectionID/Exam",ExamRouter)

SectionRouter.post("/",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateSectionValidation),
    SectionService.createSection
)

SectionRouter.patch("/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateSectionValidation),
    SectionService.createSection
)


SectionRouter.delete("/Delete/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateSectionValidation),
    SectionService.createSection
)


SectionRouter.delete("/freeze/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateSectionValidation),
    SectionService.createSection
)


SectionRouter.delete("/restore/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(CreateSectionValidation),
    SectionService.createSection
)
 







export default SectionRouter