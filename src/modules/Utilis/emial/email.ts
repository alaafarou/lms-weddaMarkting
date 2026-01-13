import { createTransport } from "nodemailer"
import Mail from "nodemailer/lib/mailer"

export enum OtpEnum {
    confirmEmail = "confirmEmail",
    Forgotpassword = "Forgotpassword",
    OpenCourse = "OpenCourse"
}


export const sendEmial = async (data: Mail.Options) => {

    const Transporter = createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        requireTLS:true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    })


    try {
        // Verify connection before sending
        await Transporter.verify();

        const info = await Transporter.sendMail({
            ...data,
            from: `${process.env.APPLICATION_NAME} <${process.env.EMAIL}>`
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        // This will show up in your remote server logs (PM2 logs or Docker logs)
        console.error("SMTP Error details:", error);
        throw error;
    }
};


