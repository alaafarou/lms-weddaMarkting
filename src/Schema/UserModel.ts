import { HydratedDocument, Schema, Types, model } from 'mongoose';
import { GenerateHash } from '../modules/Utilis/Security/hash';
import { ICourse } from './Course';
import { IOtp } from './OtpModel';
import { CountryEnum, GradeLevelEnum, StudentEnum } from '../modules/Utilis/Enums/courses';

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
  firstname: string,
  lastname: string,

  email: string,
  confrimEmailAt?: Date,

  password: string,

  role: roleEnum

  phone: string
  ParentsPhone?: string

  RestoredAt?: Date,
  RestoredBy?: Types.ObjectId,
  Country?: CountryEnum,
  Gradelevel?: GradeLevelEnum,
  StudentType?: StudentEnum,


  DeletedAt?: Date,
  DeletedBy?: Types.ObjectId,

  changeCredentialsTime?: Date
  profileimage?: String,

  Courses: ICourse[]
  Otps: IOtp[]
}


export const userSchema = new Schema<IUser>({

  lastname: {
    type: String,
    required: true
  },

  firstname: {
    type: String,
    required: true
  },

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
    unique:true,
    required:true
  },

  ParentsPhone: {
    type: String,
    required: function (this) {
      return this.role === roleEnum.user
    },
    unique:true
  },

  Country: {
    type: String,
    enum: CountryEnum,
    required: function (this) {
      return this.role === roleEnum.user
    },
  },

  Gradelevel: {
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

 
  RestoredAt: Date,
  RestoredBy: { type: Schema.Types.ObjectId, ref: "User" },


  DeletedAt: Date,
  DeletedBy: { type: Schema.Types.ObjectId, ref: "User" },

  email: { type: String, required: true },
  confrimEmailAt: Date,

  changeCredentialsTime: Date,
  profileimage: String,

}, {
  timestamps: true,
    toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual("fullname").set(function (value: String) {
  const [firstname, lastname] = value.split(" ") || []
  this.set({ firstname, lastname })
})
  .get(function () {
    return this.firstname + " " + this.lastname
  })

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









