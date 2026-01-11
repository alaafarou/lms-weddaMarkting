
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { IExam as TDocument } from "../../../Schema/Exam";
export class ExamRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

