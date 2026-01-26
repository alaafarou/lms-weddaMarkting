
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { ICode as TDocument } from "../../../Schema/Code";
export class CodeRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

