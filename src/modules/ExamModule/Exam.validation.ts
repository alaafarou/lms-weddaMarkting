import z from "zod";
import { questionEnum } from "../Utilis/Enums/courses";
import {  Types } from "mongoose";

export const CreateExamValidation = {
    params: z.strictObject({
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
    }),
    body: z.strictObject({
        name: z.string()
            .min(5, "name must not be less than 5")
            .max(100, "name must not exceed 100"),

        Duration: z.coerce.number()
            .min(1, "Duration must be at least 1 minute")
            .optional(),

        questions: z.array(
            z.strictObject({
                question: z.string()
                    .min(5, " question  must not be less than 5")
                    .max(300, " question must not exceed 300 "),

                type: z.enum(Object.values(questionEnum)),
                Answers: z.array(z.string()).optional(),
                Score: z.coerce.number().min(0, 'Score must be positive').optional(),
                correctAnswer: z.string().min(1, "Correct answer required"),
            })
        ).min(1, "At least one question required"),
    }).superRefine((data, ctx) => {
        data.questions.forEach(Question => {
            // if (
            //     Question.type === questionEnum.multiple_choice
            //             &&
            //     Question.Answers
            //             &&
            //     Question.Answers.length < 5) {

            //     ctx.addIssue({
            //         code: "custom",
            //         path: ["body"],
            //         message: ` Multiple choice questions must have at least 5 answer options (found ${Question.Answers.length})`,
            //     })
            // }
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



export const AddQuestionValidation = {
    body: z.strictObject({
        question: z.string()
            .min(5, " question  must not be less than 5")
            .max(300, " question must not exceed 300 "),
        type: z.enum(Object.values(questionEnum)),
        Answers: z.array(z.string()).optional(),
        Score: z.coerce.number().min(0, 'Score must be positive').optional(),
        correctAnswer: z.string().min(1, "Correct answer required"), 
        image: z.object({
            mimetype: z.string(),
            size: z.number(),
            path: z.string(),
        }).optional(),
    }).superRefine((data, ctx) => {
        if (
            data.type === questionEnum.multiple_choice
            &&
            data.Answers
            &&
            !data.Answers.includes(data.correctAnswer)) {
            ctx.addIssue({
                code: "custom",
                path: ["body"],
                message: `Correct anser must be one of the provided answers`,
            })
        }

        if (
            data.type === questionEnum.true_false
            &&
            !["false", "true"].includes(data.correctAnswer)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["body"],
                message: `Correct answer must be true or false`,
            })
        }
    })
}




export const ExamparamValidation = {
    params: z.strictObject({
        ExamID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
    })
}


export const StudentStatusVlaidation = {
    query: z.strictObject({
        ParentsPhone: z.string(),
        phone: z.string()
    })
}



export const DeleteExamValidation = {
    params: z.strictObject({
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        QuestionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid Question ID"),
    })
}


export const UpdateExamValidation = {
    params: z.strictObject({
        SectionID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid SectionID"),
        CourseId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid Course ID format'
        }),
        ExamID: z.string().refine((id) => {
            return Types.ObjectId.isValid(id);
        }, "Invalid Exam ID"),
    }),
    body: z.strictObject({
        name: z.string()
            .min(5, "name must not be less than 5")
            .max(100, "name must not exceed 100")
            .optional(),

        Duration: z.coerce.number()
            .min(1, "Duration must be at least 1 minute")
            .optional(),
    }).superRefine((data, ctx) => {
        console.log(data)
        const check = Object.values(data)
        if (!check.length) {
            ctx.addIssue({
                code: "custom",
                path: ["body"],
                message: "all of fields in body are empty"
            })
        }
    })
}

