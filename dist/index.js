"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserRouter_1 = __importDefault(require("./modules/UserModule/UserRouter"));
const AuthRouter_1 = __importDefault(require("./modules/AuthModule/AuthRouter"));
const path_1 = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const DBconnection_1 = require("./modules/Utilis/DBconnection");
const ErrorResponse_1 = require("./modules/Utilis/response/ErrorResponse");
const CourseRouter_1 = __importDefault(require("./modules/CourseModule/CourseRouter"));
const LmsRouter_1 = __importDefault(require("./modules/LmsModule/LmsRouter"));
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env.dev") });
const bootsrap = async () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/upload', express_1.default.static(path_1.default.join(__dirname, 'upload')));
    await (0, DBconnection_1.DBconnection)();
    app.use("/Auth", AuthRouter_1.default);
    app.use("/lms", LmsRouter_1.default);
    app.use("/User", UserRouter_1.default);
    app.use("/course", CourseRouter_1.default);
    app.use(ErrorResponse_1.GlobalError);
    app.listen(process.env.PORT, () => {
        console.log(`the application is running on port ${process.env.PORT}`);
    });
};
bootsrap();
