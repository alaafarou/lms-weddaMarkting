
import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import type { ICleanJob as TDocument } from "../../../Schema/Clean";

export class CleanRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}
