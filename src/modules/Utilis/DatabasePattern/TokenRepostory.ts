import { DatabaseRepositry } from "./DatabaseRepositry"
import { IToken as TDocument} from "../../../Schema/TokenModel"
import { Model } from "mongoose"




export class TokenRepositry extends DatabaseRepositry<TDocument> {
        constructor(protected override readonly model: Model<TDocument>) {
            super(model)
        }  
}

