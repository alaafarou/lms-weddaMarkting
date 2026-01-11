import { Router } from "express";
import { Authorization } from "../middlwares/Authentication.middleware";
import { roleEnum } from "../../Schema/UserModel";
import LmsService from "./Lms.Service";
import { validation } from "../middlwares/validation.middleware";
import { CreateLmsValidation } from "./Lms.validation";


const LmsRouter = Router()

LmsRouter.post("/",validation(CreateLmsValidation),Authorization({AcessRoles:[roleEnum.superadmin]}),LmsService.CreateLms)



export default LmsRouter



