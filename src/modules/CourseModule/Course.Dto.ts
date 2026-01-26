import z from "zod";
import { CreateCourseValidation, GetAllCoursesValidation, UpdateCourseValidation } from "./CourseValidaton";


/**
 * @openapi
 * components:
 *   schemas:
 *     CreateCourseBody:
 *       type: object
 *       required: [name, price, GradeLevel, Semester, subject]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Mathematics Grade 1"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           example: "Comprehensive math course for first grade"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 299.99
 *         GradeLevel:
 *           type: string
 *           enum:
 *             - First Preparatory
 *             - Second Preparatory
 *             - Third Preparatory
 *             - First Secondary
 *             - Second Secondary
 *             - Third Secondary
 *           example: "Third Secondary"
 *         Semester:
 *           type: string
 *           enum: [First Semester, Second Semester]
 *           example: "Second Semester"
 *         subject:
 *           type: string
 *           enum:
 *             - Algebra
 *             - Geometry
 *             - Calculus
 *             - Trigonometry
 *             - "Analytic Geometry"
 *             - "Statistics & Probability"
 *             - Vectors
 *             - Matrices
 *             - "Differential Equations"
 *             - "Integral Calculus"
 *             - "Linear Algebra"
 *             - "Complex Numbers"
 *             - computer
 *           example: "Algebra"
 *         image:
 *           type: string
 *           example: "./upload/Courses/6977601bb0d5d79830dee66c/1769431511181-1-images.jpeg"
 */
export type CreateCourseBody=z.infer<typeof CreateCourseValidation.body>;

/**
 * @openapi
 * components:
 *   schemas:
 *     CourseUpdateBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Mathematics Grade 1"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           example: "Comprehensive math course for first grade"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 299.99
 *         GradeLevel:
 *           type: string
 *           enum:
 *             - First Primary
 *             - Second Primary
 *             - Third Primary
 *             - Fourth Primary
 *             - Fifth Primary
 *             - Sixth Primary
 *             - First Preparatory
 *             - Second Preparatory
 *             - Third Preparatory
 *             - First Secondary
 *             - Second Secondary
 *             - Third Secondary
 *           example: "First Primary"
 *         Semester:
 *           type: string
 *           enum: [First Semester, Second Semester]
 *           example: "Second Semester"
 *         subject:
 *           type: string
 *           enum:
 *             - Algebra
 *             - Geometry
 *             - Calculus
 *             - Trigonometry
 *             - "Analytic Geometry"
 *             - "Statistics & Probability"
 *             - Vectors
 *             - Matrices
 *             - "Differential Equations"
 *             - "Integral Calculus"
 *             - "Linear Algebra"
 *             - "Complex Numbers"
 *             - computer
 *           example: "Algebra"
 *         image:
 *           type: string
 *           example: "./upload/Courses/6977601bb0d5d79830dee66c/1769431511181-1-images.jpeg"
 */
export type CourseUpdateBody=z.infer<typeof UpdateCourseValidation.body>;

/**
 * @openapi
 * components:
 *   schemas:
 *     GetAllCoursesBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Mathematics Grade 1"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           example: "Comprehensive math course for first grade"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 299.99
 *         GradeLevel:
 *           type: string
 *           enum:
 *             - First Primary
 *             - Second Primary
 *             - Third Primary
 *             - Fourth Primary
 *             - Fifth Primary
 *             - Sixth Primary
 *             - First Preparatory
 *             - Second Preparatory
 *             - Third Preparatory
 *             - First Secondary
 *             - Second Secondary
 *             - Third Secondary
 *           example: "First Primary"
 *         Semester:
 *           type: string
 *           enum: [First Semester, Second Semester]
 *           example: "Second Semester"
 *         subject:
 *           type: string
 *           enum:
 *             - Algebra
 *             - Geometry
 *             - Calculus
 *             - Trigonometry
 *             - "Analytic Geometry"
 *             - "Statistics & Probability"
 *             - Vectors
 *             - Matrices
 *             - "Differential Equations"
 *             - "Integral Calculus"
 *             - "Linear Algebra"
 *             - "Complex Numbers"
 *             - computer
 *           example: "Algebra"
 */
export type GetAllCoursesBody=z.infer<typeof GetAllCoursesValidation.body>;
 

export type gets=z.infer<typeof GetAllCoursesValidation.query>;