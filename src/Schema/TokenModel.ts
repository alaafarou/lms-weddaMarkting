
import { HydratedDocument, Schema, Types, model } from 'mongoose';


export interface IToken {
    jti:string,
    expiresAt:Date,
    createdBy:Types.ObjectId,
}


export const TokenSchema = new Schema<IToken>({
    jti:{type:String,required:true,unique:true},
    expiresAt:{type:Date,required:true},
    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,});


TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const TokenModel = model<IToken>('token', TokenSchema);
export type TokenHydratedDocument = HydratedDocument<IToken>






