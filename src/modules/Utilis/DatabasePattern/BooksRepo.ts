
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { IBook as TDocument } from "../../../Schema/Books";

export class BookReposatory extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

