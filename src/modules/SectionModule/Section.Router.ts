import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import { validation } from "../middlwares/validation.middleware";
import SectionService from "./Section.Service";
import { CreateSectionValidation, getAllSectionsParamsValidation, GetSectionValidation, SectionParamsValidation } from "./Section.validation";
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

SectionRouter.get("/",
    Authorization({AcessRoles:[roleEnum.admin , roleEnum.user]}),
    validation(getAllSectionsParamsValidation),
    SectionService.getAllSections
)

SectionRouter.get("/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin , roleEnum.user]}),
    validation(GetSectionValidation),
    SectionService.GetSection
)

SectionRouter.patch("/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.UpdateSection
)


SectionRouter.delete("/Delete/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.DeleteSection
)

SectionRouter.delete("/freeze/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.freezeSection
)

SectionRouter.patch("/restore/:SectionID",
    Authorization({AcessRoles:[roleEnum.admin]}),
    validation(SectionParamsValidation),
    SectionService.RestoreSection
)



export default SectionRouter
