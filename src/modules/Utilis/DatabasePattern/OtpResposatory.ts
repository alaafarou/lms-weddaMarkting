import { DatabaseRepositry } from "./DatabaseRepositry";
import { Model} from "mongoose";
import {IOtp as TDocument} from "../../../Schema/OtpModel"


export class OtpRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}