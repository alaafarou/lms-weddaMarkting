import { Router } from "express"
import { Authorization } from "../middlwares/Authentication.middleware"
import { roleEnum } from "../../Schema/UserModel"
import { validation } from "../middlwares/validation.middleware"
import { CreateBookValidation, DeleteBooksValidation, UpdateBooksValidation } from "./BooksValidations"
import { fileValidation, folderEnum, localFileUpload } from "../Utilis/multer/cloud.multer"
import BooksService from "./BooksService"

const BookRouter = Router()


BookRouter.post("/",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Books })
    .single("image"),
    validation(CreateBookValidation),
    BooksService.CreateBook
)

BookRouter.get("/AllBooks",
    Authorization({ AcessRoles: [roleEnum.admin,roleEnum.user] }),
    validation(UpdateBooksValidation),
    BooksService.GetAllBooks

)


BookRouter.patch("/:BooksId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    localFileUpload({ validation: fileValidation.image, folder: folderEnum.Books })
    .single("image"),
    validation(UpdateBooksValidation),
    BooksService.UpdateBooks
)

BookRouter.delete("/:BooksId",
    Authorization({ AcessRoles: [roleEnum.admin] }),
    validation(DeleteBooksValidation),
    BooksService.DeleteBooks

)


export default BookRouter


