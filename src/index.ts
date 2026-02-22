import type { Express } from "express"
import express from "express"
import UserRouter from "./modules/UserModule/UserRouter"
import AuthRouter from "./modules/AuthModule/AuthRouter"
import path, { resolve } from "path"
import { config } from "dotenv"
import { DBconnection } from "./modules/Utilis/DBconnection"
import { GlobalError } from "./modules/Utilis/response/ErrorResponse"
import CourseRouter from "./modules/CourseModule/CourseRouter"
import ExamService from "./modules/ExamModule/Exam.Service"
import { validation } from "./modules/middlwares/validation.middleware"
import { StudentStatusVlaidation } from "./modules/ExamModule/Exam.validation"
import CodeRouter from "./modules/CodeModule/CodeRouter"
import cors from "cors"
config({ path: resolve("./config/.env.dev") })


const bootsrap = async () => {

    const app: Express = express()

  

    app.use(express.json())

    app.use(cors({
        origin: '*', // For development, this allows all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));




    await DBconnection()

    app.use('/upload', express.static(path.join(__dirname, '../src/upload')));

   
    app.use("/Auth", AuthRouter)
    app.use("/User", UserRouter)
    app.use("/courses", CourseRouter)
    app.use("/Code", CodeRouter)
    app.get("/ParentSupervision", validation(StudentStatusVlaidation), ExamService.StudentExamStatus)



    app.use(GlobalError)

    app.listen(process.env.PORT, () => {
        console.log(`the application is running on port ${process.env.PORT}`)
    })

}

bootsrap()

