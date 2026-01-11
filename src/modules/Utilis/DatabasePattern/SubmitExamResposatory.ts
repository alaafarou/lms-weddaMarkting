
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { ISubmition as TDocument } from "../../../Schema/Submition";

export class SubmissionReposatory extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}
