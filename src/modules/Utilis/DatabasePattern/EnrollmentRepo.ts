
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { IEnrollment as TDocument } from "../../../Schema/Enrollment";
export class EnrollmentRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

