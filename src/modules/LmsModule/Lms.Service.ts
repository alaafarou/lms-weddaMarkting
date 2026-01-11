import type {Request,Response, NextFunction } from "express"
import { LMSModel } from "../../Schema/lms"
import { LmsRepositry } from "../Utilis/DatabasePattern/LmsReposatory"
import { BadRequestException } from "../Utilis/response/ErrorResponse"
import { SuccesResponse } from "../Utilis/response/SucessResponse"

class LmsService {

    private readonly LmsModel : LmsRepositry  = new LmsRepositry(LMSModel)

    constructor() {}

  
    CreateLms = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const {Name,DB_Name,Host} = req.body

        const host = req.headers.host

        if(host !== process.env.MMAINHOST)
        {
            throw new BadRequestException("sorry this only belong to main app domain")
        }

        const checkLms = await this.LmsModel.findOne({
            filter: {
                Name,
            }
        })

        if (checkLms) {
            throw new BadRequestException("this LMS already created")
        }

        const [lms] = await this.LmsModel.create({
            data: [
                {
                    Name,
                    DB_Name,
                    Host,
                    CreatedBy:req.user?._id!    
                }
            ]
        }) || []


        if (!lms) {
            throw new BadRequestException("Errore in Creating New Lms in system")
        }

        return SuccesResponse({ res, data: { lms } })
    }
    
}
export default new LmsService();


