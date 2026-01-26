
import multer, { FileFilterCallback } from "multer";
import type { Request } from "express"
import { resolve } from "path"
import { existsSync, mkdirSync } from "fs";
import { BadRequestException } from "../response/ErrorResponse";


export interface IMultter extends Express.Multer.File {
    finalpath: string
}

export enum folderEnum {
    User = "User",
    Courses = "Courses",
    lectures = "lectures",
    Exam = "Exam"
}

export const fileValidation = {
    image: ["image/jpeg", "image/png", "image/git"],
}


export const localFileUpload = ({
    validation = [],
    folder,
    fileSize = 5 * 1024 * 1024,
}: {
    validation?: string[],
    folder?: string
    fileSize?: number
}) => {
    let basepath = `./upload/${folder}`
    const storage = multer.diskStorage({
        destination: function (req, file: Express.Multer.File, callback) {
            if (req.user?._id ){
                basepath += `/${req.user?.id}`
            }
            const fullpath = resolve(`./src/${basepath}`)
            if (!existsSync(fullpath)) {
                mkdirSync(fullpath, { recursive: true })
            }
            callback(null, fullpath)
        },
        filename: function (req: Request, file: IMultter, callback) {
            const fileName = Date.now() + '-' + Math.round(Math.random()) + "-" + file.originalname
            file.finalpath = `${basepath}/${fileName}`
            callback(null, fileName)
        }
    })

    function fileFilter(
        req: Request,
        file: Express.Multer.File,
        callback: FileFilterCallback): void {

        if (!validation.includes(file.mimetype)) {
            callback(new BadRequestException("cant upload the file"))
        }
        callback(null, true)

    }

    return multer({ fileFilter, storage, limits: { fileSize } })
}

