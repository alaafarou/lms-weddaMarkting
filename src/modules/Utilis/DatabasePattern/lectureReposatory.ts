
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { ILecture as TDocument } from "../../../Schema/lecture";

export class LectureRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

