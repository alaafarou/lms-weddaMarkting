import z from "zod";
import { CreateExamValidation } from "./Exam.validation";






export type CreateExamBody  = z.infer<typeof CreateExamValidation.body>