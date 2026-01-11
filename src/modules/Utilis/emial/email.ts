import { createTransport } from "nodemailer"
import Mail from "nodemailer/lib/mailer"

export  enum OtpEnum {
  confirmEmail = "confirmEmail",
  Forgotpassword = "Forgotpassword",
  OpenCourse = "OpenCourse"
}


export const sendEmial = async (data:Mail.Options) =>{

    const Transporter = createTransport({
        service : "gmail",
        auth :{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    
    await Transporter.sendMail({
        ...data,
        from: `${process.env.APPLICATION_NAME} _ <${process.env.EMAIL}>`
    })
    
}
