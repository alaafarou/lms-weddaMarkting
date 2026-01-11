
import EventEmitter from "events";
import Mail from "nodemailer/lib/mailer";
import { OtpEnum, sendEmial } from "./email";

export const EmailEvent = new EventEmitter();

export interface IEmail extends Mail.Options {
    otp: number
}

EmailEvent.on(OtpEnum.confirmEmail, async (data: IEmail) => {
    try {
        data.text = data.otp as unknown as string,
        data.subject = "confrirm Email otp",
        await sendEmial(data)
    } catch (error) {
        console.log("failed to send otp")
    }
})


EmailEvent.on(OtpEnum.Forgotpassword, async (data: IEmail) => {
    try {
        data.text = data.otp as unknown as string,
        data.subject = "Forgotpassword",
        await sendEmial(data)
    } catch (error) {
        console.log("failed to send otp")
    }
})

EmailEvent.on(OtpEnum.OpenCourse, async (data: IEmail) => {
    try {
        data.text = data.otp as unknown as string,
        data.subject = "AcessCode",
        await sendEmial(data)
    } catch (error) {
        console.log("failed to send otp")
    }
})












