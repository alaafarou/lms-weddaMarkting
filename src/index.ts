import type { Express } from "express"
import express from "express"
import UserRouter from "./modules/UserModule/UserRouter"
import AuthRouter from "./modules/AuthModule/AuthRouter"
import path, { resolve } from "path"
import { config } from "dotenv"
import { DBconnection } from "./modules/Utilis/DBconnection"
import { GlobalError } from "./modules/Utilis/response/ErrorResponse"
import CourseRouter from "./modules/CourseModule/CourseRouter"
import LmsRouter from "./modules/LmsModule/LmsRouter"
config({ path: resolve("./config/.env.dev") })


const bootsrap = async () => {



    const app: Express = express()
    app.use(express.json())
    app.use('/upload', express.static(path.join(__dirname, 'upload')));
    await DBconnection()


    app.use("/Auth", AuthRouter)
    app.use("/lms",LmsRouter)
    app.use("/User",UserRouter)
    app.use("/course", CourseRouter)



    app.use(GlobalError)

    app.listen(process.env.PORT, () => {
        console.log(`the application is running on port ${process.env.PORT}`)
    })

}

bootsrap()


