import { DatabaseRepositry } from "./DatabaseRepositry"
import { Model } from "mongoose"
import { ILMS as TDocument } from "../../../Schema/lms"




export class LmsRepositry extends DatabaseRepositry<TDocument> {
        constructor(protected override readonly model: Model<TDocument>) {
            super(model)
        }  
}

