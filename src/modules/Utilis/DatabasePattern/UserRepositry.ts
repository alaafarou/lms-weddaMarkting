import { DatabaseRepositry } from "./DatabaseRepositry";
import { IUser as TDocument } from "../../../Schema/UserModel";
import { Model, CreateOptions, HydratedDocument } from "mongoose";
import { BadRequestException } from "../response/ErrorResponse";


export class UserRepositry extends DatabaseRepositry<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }

    async createUser({
        data,
        options = { validateBeforeSave: true }
    }: {
        data: Partial<TDocument>[],
        options?: CreateOptions
    }): Promise<HydratedDocument<TDocument>> {
        const [user] = await this.create({ data, options }) || []
        if (!user) {
            throw new BadRequestException("failed to create this user")
        }
        return user
    }
}