
import EventEmitter from "events";
import { Request } from "express";
import { HydratedDocument, Model } from "mongoose";
import { IExam } from "../../Schema/Exam";
export const ExamEvent = new EventEmitter();

interface SubmitExam{
    req:Request,
    Exam:HydratedDocument<IExam>
    submition:HydratedDocument<IExam>
}

ExamEvent.on("SubmitExam", async(data:SubmitExam) => {
    const {Exam,submition} = data
    try {
        setInterval(()=>{
          const {ques}
        },Exam.Duration as number)
  
    } catch (error) {
        console.log("failed to send otp")
    }
})