import { connect } from "mongoose"



export const DBconnection = async () => {
    try {
        const link = process.env.DBLink as string
        await connect(link, { serverSelectionTimeoutMS: 3000 })
        console.log("Done conneting to Database")

    } catch (error) {
        console.log("failed to connect to the Database ", error)
        throw error
    }
}

