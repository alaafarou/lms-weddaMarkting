
import { HydratedDocument, model, Schema, Types } from "mongoose";
import { IUser } from "./UserModel";
import { GenerateHash } from "../modules/Utilis/Security/hash";
import { EmailEvent } from "../modules/Utilis/emial/EmailEvent";
import { OtpEnum } from "../modules/Utilis/emial/email";
import { ICourse } from "./Course";




export interface IOtp {
  _id: Types.ObjectId
  code: string,
  expiresAt: Date,
  createdBy: Types.ObjectId | IUser,
  type: OtpEnum,
  student: Types.ObjectId | IUser
  course: Types.ObjectId | ICourse,
  IsUsed:boolean
}

const OtpSchema = new Schema<IOtp>({
  code: {
    type: String,
    required: true
  },

  expiresAt: {
    type: Date,
    required: true
  },

  type: {
    type: String,
    enum: Object.values(OtpEnum),
    required: true
  },

  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function (this) {
      return this.type === OtpEnum.OpenCourse
    },
    default: null
  },

  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: function (this) {
      return this.type === OtpEnum.OpenCourse
    },
    default: null
  },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

}, { timestamps: true })


OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // this means after the when exper

OtpSchema.pre("save", async function (this: OtpHydratedDocument & { wasnew: boolean, otpcode: string, otpType: OtpEnum }, next) {
  this.wasnew = this.isNew
  if (this.isModified("code")) {
    if (this.type !== OtpEnum.OpenCourse) {
      this.otpcode = this.code
      console.log(`otp is: ${this.code}`)
      this.code = await GenerateHash({ plaintext: this.code })
      await this.populate([{ path: "createdBy", select: "email" }])
    }
    else {
      this.otpcode = this.code
      this.otpType = this.type
      console.log(this.otpcode)
      console.log(this.otpType)
      this.code = await GenerateHash({ plaintext: this.code })
      await this.populate([{ path: "student", select: "email" }])
    }
  }
  next()
})

OtpSchema.post("save", async function (doc, next) {
  const that = this as OtpHydratedDocument & { wasnew: boolean, otpcode: string, otpType: OtpEnum }
  if (that.wasnew && that.otpcode && that.otpType !== OtpEnum.OpenCourse) {
    EmailEvent.emit(this.type, { to: (that.createdBy as any).email, otp: that.otpcode })
    console.log(`we send email to: ${(that.createdBy as any).email}`)
  } else {
    EmailEvent.emit(this.type, { to: (that.student as any).email, otp: that.otpcode })
    console.log(`we send email to: ${(that.student as any).email}`)
  }
  next()
})

export const OtpModel = model<IOtp>("Otp", OtpSchema)
export type OtpHydratedDocument = HydratedDocument<IOtp>;




