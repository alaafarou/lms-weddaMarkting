import type { Response, Request, NextFunction } from "express"
import { ZodType } from "zod"
import { BadRequestException } from "../Utilis/response/ErrorResponse"


type ReqKeysTypes = keyof Request
type validationSchema = Partial<Record<ReqKeysTypes, ZodType>>
type validationErrores = Array<{
    key: ReqKeysTypes,
    issues: Array<{
        message: string,
        path: (string | number | symbol | undefined )[]
    }>
}>
export const validation = (Schema: validationSchema) => {

    return (req: Request, res: Response, next: NextFunction) => {

        let validationErrores: validationErrores = []

        for (const key of Object.keys(Schema) as ReqKeysTypes[]) {

            if (req.file) {
                req.body.image = req.file
            }

            // if (req.files) {
            //     req.body.attachments = req.files
            // }


            if (!Schema[key]) continue;
            const validationResult = Schema[key].safeParse(req[key])

            if (!validationResult.success) {
                validationErrores.push({
                    key,
                    issues: validationResult.error.issues.map((issue) => {
                        return { message: issue.message, path: issue.path }
                    })
                })
            }
        }

        if (validationErrores.length) {
            throw new BadRequestException("validation Error", validationErrores)
        }

        next()

    }
}

