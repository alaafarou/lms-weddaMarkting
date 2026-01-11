import z, { date } from "zod";
import { questionEnum } from "../Utilis/Enums/courses";
import { Types } from "mongoose";

export const CreateExamValidation = {
    params: z.strictObject({
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        CourseId: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
    }),
    body: z.strictObject({
        name: z.string()
            .min(5, "name must not be less than 5")
            .max(100, "name must not exceed 100"),

        questions: z.array(  // ✅ Fixed: array of questions
            z.strictObject({
                question: z.string()
                    .min(5, " question  must not be less than 5")
                    .max(300, " question must not exceed 300 "),

                type: z.enum(Object.values(questionEnum)),
                Answers: z.array(z.string()).optional(),  // A least 2 options
                correctAnswer: z.string().min(1, "Correct answer required")
            })
        ).min(1, "At least one question required"),  // ✅ At least 1 question
    }).superRefine((data, ctx) => {
        data.questions.forEach(Question => {
            if (
                Question.type === questionEnum.multiple_choice
                &&
                Question.Answers
                &&
                Question.Answers.length < 5) {

                ctx.addIssue({
                    code: "custom",
                    path: ["body"],
                    message: ` Multiple choice questions must have at least 5 answer options (found ${Question.Answers.length})`,
                })
            }
            if (
                Question.type === questionEnum.multiple_choice
                &&
                Question.Answers
                &&
                !Question.Answers.includes(Question.correctAnswer)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["body"],
                    message: `Correct anser must be one of the provided answers`,
                })
            }

            if (
                Question.type === questionEnum.true_false
                &&
                !["false", "true"].includes(Question.correctAnswer)
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["body"],
                    message: `Correct answer must be true or flase`,
                })
            }
        })
    })
};


export const ExamparamValidation = {
    params: z.strictObject({
        ExamID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
    })
}



// export const ExamparamValidation = {
//     params: z.strictObject({
//         ExamID: z.string().refine((id) => {
//             return Types.ObjectId.isValid(id);
//         }, "Invalid SectionID"),
//     })
// }    

