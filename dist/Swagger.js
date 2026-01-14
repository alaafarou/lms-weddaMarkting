"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerDocs = exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = require("swagger-ui-express");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My Express API',
            version: '1.0.0',
            description: 'A NestJS-style API built with Express and TypeScript',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: [
        './src/modules/AuthModule/AuthRouter.ts',
        './src/modules/AuthModule/Auth.Dto.ts',
        './src/modules/CourseModule/Course.Dto.ts',
        './src/modules/CourseModule/CourseRouter.ts',
        './dist/modules/AuthModule/AuthRouter.js',
        './dist/modules/AuthModule/Auth.Dto.js'
    ],
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
const SwaggerDocs = (app, Port) => {
    app.use("/docs", swagger_ui_express_1.serve, (0, swagger_ui_express_1.setup)(exports.specs));
    app.get("docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(exports.specs);
    });
};
exports.SwaggerDocs = SwaggerDocs;
