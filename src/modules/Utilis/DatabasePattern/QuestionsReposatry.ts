
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { IQuestion as TDocument } from "../../../Schema/Questions";
export class QuestionRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

