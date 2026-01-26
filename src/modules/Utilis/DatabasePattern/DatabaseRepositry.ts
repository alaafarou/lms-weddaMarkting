import type { Model, UpdateWriteOpResult, CreateOptions, HydratedDocument, QueryOptions, ProjectionType, RootFilterQuery, MongooseUpdateQueryOptions, UpdateQuery, UpdateWithAggregationPipeline, PopulateOptions, QueryWithHelpers } from "mongoose";


export abstract class DatabaseRepositry<Tdocument> {

    constructor(protected readonly model: Model<Tdocument>) { }



    async create({
        data,
        options,
    }: {
        data: Partial<Tdocument>[],
        options?: CreateOptions

    }): Promise<HydratedDocument<Tdocument>[] | undefined> {
        return await this.model.create(data, options)
    }


    async findOne({
        filter,
        select,
        options
    }: {
        filter: RootFilterQuery<Tdocument>,
        select?: ProjectionType<Tdocument> | null,
        options?: QueryOptions<Tdocument>
    }): Promise<HydratedDocument<Tdocument> | null> {


        let doc = this.model.findOne(filter || {}).select(select || "");

        if (options?.populate) {
            doc.populate(options?.populate as PopulateOptions[])
        }

        if (options?.skip) {
            doc.skip(options.skip)
        }
        if (options?.limit) {
            doc.limit(options.limit)
        }

        return await doc.exec()
    }


    async find({
        filter,
        options,
        select
    }: {
        filter?: RootFilterQuery<Tdocument>,
        select?: ProjectionType<Tdocument> | null,
        options?: QueryOptions<Tdocument>

    }): Promise<HydratedDocument<Tdocument>[] | []> {

        let doc = this.model.find(filter || {}).select(select || "");

        if (options?.populate) {
            doc.populate(options?.populate as PopulateOptions[])
        }

        if (options?.skip) {
            doc.skip(options.skip)
        }
        if (options?.limit) {
            doc.limit(options.limit)
        }

        return await doc.exec()

    }



    async updateOne({
        filter,
        update,
        options = {},
    }: {
        filter: RootFilterQuery<Tdocument>,
        update: UpdateQuery<Tdocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<Tdocument> | null
    }): Promise<UpdateWriteOpResult> {
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: ["$__v", 1] }
                }
            })

            return await this.model.updateOne(filter, update, options)

        }
        return await this.model.updateOne(filter,
            { ...update, $inc: { __v: 1 } },
            options
        )
    }

    async updateMany({
        filter,
        update,
        options = { }
    }: {
        filter: RootFilterQuery<Tdocument>,
        update: UpdateQuery<Tdocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<Tdocument> | null
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(filter,
            { ...update, $inc: { __v: 1 } },  // Keep your version increment
            options
        );
    }

    async findOneAndupdate({
        filter,
        update,
        options = { new: true }
    }: {
        filter: RootFilterQuery<Tdocument>,
        update: UpdateQuery<Tdocument> | UpdateWithAggregationPipeline,
        options?: QueryOptions<Tdocument> | null
    }): Promise<HydratedDocument<Tdocument> | null> {

        return await this.model.findOneAndUpdate(filter,
            { ...update, $inc: { __v: 1 } },
            options
        )
    }
    async findOneAndDelete({
        filter,
        options
    }: {
        filter: RootFilterQuery<Tdocument>,
        options?: QueryOptions<Tdocument> | null
    }): Promise<HydratedDocument<Tdocument> | null> {
        return await this.model.findOneAndDelete(filter, options)
    }


    async deleteMany({
        filter,
    }: {
        filter: RootFilterQuery<Tdocument>
    }) {
        return await this.model.deleteMany(filter)
    }



    async paginate({
        filter = {},
        options = {},
        page = "all",
        size = 5
    }: {

        filter?: RootFilterQuery<Tdocument>,
        options?: QueryOptions<Tdocument> | undefined
        page?: number | "all",
        size?: number;

    }): Promise<HydratedDocument<Tdocument>[] | [] | any> {
        let countdoc: number | undefined = undefined;
        let pages: number | undefined = undefined

        if (page !== "all") {
            page = Math.floor(page < 1 ? 1 : page)
            options.limit = Math.floor(size > 1 || !size ? 5 : size)

            options.skip = (page - 1) * options.limit
            console.log(`this is page ${page}`)

            countdoc = await this.model.countDocuments(filter)
            pages = Math.ceil(countdoc / options.limit)
        }

        console.log(filter, page, size)

        const result = await this.find({ filter, options })

        return {
            pages,
            countdoc,
            result,
            currentpage: page !== "all" ? page : undefined,
            size
        }
    }


}

