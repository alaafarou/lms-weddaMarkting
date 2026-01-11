
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import { ISection as TDocument } from "../../../Schema/Section";


export class SectionRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}

