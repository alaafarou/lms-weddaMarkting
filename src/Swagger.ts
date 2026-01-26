import swaggerJsdoc from 'swagger-jsdoc';
import type { Request, Response, Express } from 'express';
import { serve, setup } from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My Express API',
            version: '1.0.0',
            description: 'A NestJS-style API built with Express and TypeScript',
        },
        servers: [{ url: 'http://localhost:3000' }],
        // 1. Define the Security Scheme
        // components: {
        //   securitySchemes: {
        //     bearerAuth: {            // Arbitrary name for the security scheme
        //       type: 'http',
        //       scheme: 'bearer',
        //       bearerFormat: 'JWT',   // Optional, just for documentation
        //     },
        //   },
        // },
        // // 2. Apply security globally (Optional: remove this if you want to secure routes individually)
        // security: [
        //   {
        //     bearerAuth: [],
        //   },
        // ],
    },
    apis: [
        './src/modules/AuthModule/AuthRouter.ts',
        './src/modules/AuthModule/Auth.Dto.ts',

        './src/modules/CourseModule/Course.Dto.ts',
        './src/modules/CourseModule/CourseRouter.ts',


        './src/modules/SectionModule/Section.Router.ts',
        './src/modules/ExamModule/Exam.Router.ts',



        
        './dist/modules/AuthModule/AuthRouter.js',
        './dist/modules/AuthModule/Auth.Dto.js',

        './src/modules/CodeModule/CodeRouter.ts',

    ],
};

export const specs = swaggerJsdoc(options);


export const SwaggerDocs = (app: Express, Port: number) => {

    app.use("/docs", serve, setup(specs))

    app.get("docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json")
        res.send(specs)
    })

}