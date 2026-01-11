
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { ICourse as TDocument } from "../../../Schema/Course";

export class CourseRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

