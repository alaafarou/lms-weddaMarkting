import { HydratedDocument, Schema, Types, model } from 'mongoose';
import { GenerateHash } from '../modules/Utilis/Security/hash';
import { ICourse } from './Course';
import { IOtp } from './OtpModel';
import { CountryEnum, GradeLevelEnum, StatusEnum, StudentEnum } from '../modules/Utilis/Enums/courses';

export enum genderEnum {
  male = "male",
  female = "female"
}

export enum roleEnum {
  user = "user",
  admin = "admin",
  superadmin = "SuperAdmin"
}

export enum providerEnum {
  system = "system",
  google = "google"
}


export interface IUser {
  fullname: string,


  email: string,
  confrimEmailAt?: Date,

  password: string,

  role: roleEnum

  phone: string
  ParentsPhone?: string
  Country?: CountryEnum,
  GradeLevel?: GradeLevelEnum,
  StudentType?: StudentEnum,



  RestoredAt?: Date,
  RestoredBy?: Types.ObjectId,

  DeletedAt?: Date,
  DeletedBy?: Types.ObjectId,

  profileimage?: String,

  Status?: StatusEnum,
  Session_id?: string,

  Courses: ICourse[]
  Otps: IOtp[]
}


export const userSchema = new Schema<IUser>({

  fullname: {
    type: String,
    required: true
  },

  Session_id:String,

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: roleEnum,
    default: roleEnum.user
  },

  phone: {
    type: String,
    unique: true,
    required: function (this) {
      return this.role === roleEnum.user
    },
  },

  ParentsPhone: {
    type: String,
    unique: true,   
  },

  Country: {
    type: String,
    enum: CountryEnum,
    required: function (this) {
      return this.role === roleEnum.user
    },
  },

  GradeLevel: {
    type: String,
    enum: GradeLevelEnum,
    required: function (this) {
      return this.role === roleEnum.user
    },
  },

  StudentType: {
    type: String,
    enum: StudentEnum,
    required: function (this) {
      return this.role === roleEnum.user
    },
  },

  Status: {
    type: String,
    enum: StatusEnum,
    default: StatusEnum.Active
  },


  RestoredAt: Date,
  RestoredBy: { type: Schema.Types.ObjectId, ref: "User" },


  DeletedAt: Date,
  DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },

  email: { type: String, required: true , index: true, unique: true},
  confrimEmailAt: Date,

  profileimage: String,

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});




userSchema.virtual("Otps", {
  localField: "_id", // primary key 
  foreignField: "createdBy", // forenkey refers on primary key
  ref: "Otp"
})

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await GenerateHash({ plaintext: this.password })
  }
})

export const UserModel = model<IUser>("User", userSchema)
export type UserHydratedDocument = HydratedDocument<IUser>









