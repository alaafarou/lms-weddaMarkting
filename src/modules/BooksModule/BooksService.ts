import { BookModel } from "../../Schema/Books";
import { BookReposatory } from "../Utilis/DatabasePattern/BooksRepo";
import { Request, Response, NextFunction } from "express";
import { IMultter } from "../Utilis/multer/cloud.multer";
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { StatusEnum } from "../Utilis/Enums/courses";

class BooksService {

    private readonly BooksModel: BookReposatory = new BookReposatory(BookModel);


    constructor() { }

    // perfect test and everything is ok
    CreateBook = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const file = req.file as IMultter

        const Status = req.body.Status

        let Data = {
            ...req.body,
            image: file?.finalpath,
            CreatedBy: req.user?._id!,

        }

        if (Status === StatusEnum.InActive) {
            Data = {
                ...req.body,
                image: file?.finalpath,
                CreatedBy: req.user?._id!,
                Status,
            }

        }

        const checkBooks = await this.BooksModel.findOne({
            filter: {
                name: req.body.name,
            }
        })
        if (checkBooks) {
            throw new ConflictException("this Books with this name already created")
        }

        const [Books] = await this.BooksModel.create({
            data: [Data]
        }) || []
        if (!Books) {
            throw new BadRequestException("failed to create this Books")
        }
        return SuccesResponse({ res, data: Books })
    }

    UpdateBooks = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { name } = req.body
        const { BooksId } = req.params
        const file = req.file as IMultter
        if (name && (await this.BooksModel.findOne({
            filter: {
                name,
                _id: BooksId
            }
        }))) {
            throw new ConflictException("Sorry this name already used")
        }

        const updateBooks = await this.BooksModel.findOneAndupdate({
            filter: {
                _id: BooksId
            },
            update: {
                ...req.body,
                image: file?.finalpath
            }
        })
        if (!updateBooks) {
            throw new BadRequestException("sorry failed to update Books please try again later")
        }
        return SuccesResponse({ res, statuscode: 200, data: updateBooks });
    }

    GetAllBooks = async (req: Request, res: Response, next: NextFunction) => {
        const { page, size } = req.query as unknown as { page: number, size: number }
        const { GradeLevel , Status, name } = req.query
        const query: any = {};

        if (name) query.name = { $regex: name, $options: "i" };
        if (GradeLevel) query.GradeLevel = GradeLevel;
        if (Status) query.Status = Status;

        const Books = await this.BooksModel.paginate({
            filter: query,
            page,
            size,
        });
        if (!Books) {
            throw new NotFoundException("No Books found matching criteria");
        }
        return SuccesResponse({ res, data: { Books } });
    };

    DeleteBooks = async (req: Request, res: Response, next: NextFunction) => {
        const { BooksId } = req.params

        const Books = await this.BooksModel.findOneAndDelete({
            filter: {
                _id:BooksId,
            },
        })

        if (!Books) {
            throw new BadRequestException("sorry failed to Delete the Books as it must be in IActive status")
        }

        return SuccesResponse({ res, message: "Done the Books is Deleted" })
    }
}

export default new BooksService();