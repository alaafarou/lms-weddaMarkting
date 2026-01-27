import type { Response, Request, NextFunction } from "express"
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory";
import { BadRequestException, ConflictException, NotFoundException } from "../Utilis/response/ErrorResponse";
import { SuccesResponse } from "../Utilis/response/SucessResponse";
import { LectureModel } from "../../Schema/lecture";
import { Types } from "mongoose";
import { EnrollmentRepositry } from "../Utilis/DatabasePattern/EnrollmentRepo";
import { EnrollmentModel } from "../../Schema/Enrollment";
import { CodeRepositry } from "../Utilis/DatabasePattern/CodeRepo";
import { CodeModel, CodeStatusEnum, CodeTypeEnum } from "../../Schema/Code";
import { CourseRepositry } from "../Utilis/DatabasePattern/CourseReposatory";
import { CourseModel } from "../../Schema/Course";

class lectureService {
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel)
    private readonly EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel)
    private readonly CodeModel: CodeRepositry = new CodeRepositry(CodeModel)
    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel)
    

    constructor() { }

    // private async fetchYouTubeMetadata(videoId: string) {
    //     const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;

    //     const response = await fetch(url);
    //     const data = await response.json();

    //     if (!data.items?.length) {
    //         throw new Error('Video not found');
    //     }

    //     const item = data.items[0];
    //     const durationISO = item.contentDetails.duration; // "PT1H2M30S"
    //     const durationSeconds = parseISODuration(durationISO);

    //     return {
    //         LectureName: item.snippet.title,
    //         description: item.snippet.description,
    //         durationSeconds,
    //     };
    // }

    createlecture = async (req: Request, res: Response, next: NextFunction) => {
        const { SectionID, CourseId } = req.params
        const { videoUrl, LectureName } = req.body

        const SectionId = Types.ObjectId.createFromHexString(SectionID!)
        const courseId = Types.ObjectId.createFromHexString(CourseId!)

        const [lecture] = await this.LectureModel.create({
            data: [
                {
                    videoUrl,
                    LectureName,
                    SectionId,
                    CourseId: courseId,
                    createdBy: req.user?._id!,
                }
            ]
        }) || []
        if (!lecture) {
            throw new BadRequestException("sorry failed to create the lecture")
        }
        return SuccesResponse({ res, data: { lecture } })
    }

    Updatelecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params
        const { videoUrl, LectureName } = req.body

        const lecture = await this.LectureModel.findOneAndupdate({
            filter:
            {
                _id: LectureId,
                DeletedAt: { $exists: false }
            },
            update: {
                videoUrl,
                LectureName
            },
            options: {
                new: false
            }

        })
        if (!lecture) {
            throw new BadRequestException("sorry this lecture doesnt exists ")
        }
        return SuccesResponse({ res, data: lecture })
    }



    // perfect test and everything is ok
    FreezeLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params
        const Lecture = await this.LectureModel.findOneAndupdate({
            filter: {
                _id: LectureId,
            },
            update: {
                DeletedAt: new Date(),
                DeletedBy: req.user?._id,
                $unset: {
                    RestoredAt: 1,
                    RestoredBy: 1
                },
            },
            options: { new: false }
        })
        if (!Lecture) {
            throw new NotFoundException("sorry failed to freeze the lecture as it must be in IActive status")
        }

        return SuccesResponse({ res, statuscode: 200 });
    }

    // perfect test and everything is ok
    RestoreLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params

        const Lecture = await this.LectureModel.findOneAndupdate({
            filter: {
                _id: LectureId,
                DeletedAt: { $exists: true },
            },
            update: {
                RestoredAt: Date.now(),
                RestoredBy: req.user?._id,
                $unset: {
                    DeletedAt: 1,
                    DeletedBy: 1,
                },
            },
            options: { new: false }
        })
        if (!Lecture) {
            throw new BadRequestException("sorry failed to Restore the lecture check if its already deleted")
        }
        return SuccesResponse({ res, });
    }

    // perfect test and everything is ok
    DeleteLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params

        const Lecture = await this.LectureModel.findOneAndDelete({
            filter: {
                _id: LectureId,
                DeletedAt: { $exists: true },
            },
        })
        if (!Lecture) {
            throw new BadRequestException("sorry failed to Delete the lecture as it must be in IActive status")
        }

        return SuccesResponse({ res })
    }

    // perfect test and everything is ok
    GetLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params

        const Lecture = await this.LectureModel.findOne({
            filter: {
                _id: LectureId,
            },
            options:{
                populate:[{
                     path:'viewedBy',
                     select:'fullname phone parentsPhone'
                }],
                lean:true      
            },     
        })

        if (!Lecture) {
            throw new NotFoundException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: Lecture });
    }



    ActivateLecture = async (req: Request, res: Response, next: NextFunction) => {
        const { LectureId } = req.params
        const { Code } = req.body

        const checkenrolled = await this.EnrollmentModel.findOne({
            filter: {
                LectureId: Types.ObjectId.createFromHexString(LectureId!),
                UserId: req.user?._id,
                courseId:{$exists:false}
            }
        })

        if (checkenrolled) {
            throw new ConflictException("this User already enrolled in this Lecture")
        }

        const checkCode = await this.CodeModel.findOne({
            filter: {
                Code,
                lectureId: Types.ObjectId.createFromHexString(LectureId!)
            }
        })

        if (checkCode?.CodeType === CodeTypeEnum.General) {

            const enroll = await this.EnrollmentModel.create({
                data: [
                    {
                        UserId: req.user?._id!,
                        LectureId: Types.ObjectId.createFromHexString(LectureId!),
                        CreatedAt: new Date()
                    }
                ]
            }) || []

            if (!enroll) {
                throw new BadRequestException("Sorry Error while Activating Lecture")
            }

            return SuccesResponse({ res })
        }

        const code = await this.CodeModel.findOneAndupdate({
            filter: {
                Code,
                LectureId: Types.ObjectId.createFromHexString(LectureId!),
                CodeStatus: CodeStatusEnum.Unused
            },
            update: {
                Usedby: req.user?._id,
                UsedAt: new Date(),
                CodeStatus: CodeStatusEnum.Used
            },
            options: { new: false }
        })

        if (!code) {
            throw new NotFoundException("this ACtivation Code is Invalid")
        }

        const Enrollment = await this.EnrollmentModel.create({
            data: [
                {
                    UserId: req.user?._id!,
                    LectureId: Types.ObjectId.createFromHexString(LectureId!),
                    CreatedAt: new Date()

                }
            ]
        }) || []


        if (!Enrollment) {
            throw new BadRequestException("Sorry Error while Activating Lecture")
        }

        return SuccesResponse({ res })
    }

    playlecture = async (req: Request, res: Response, next: NextFunction) => {
       const { LectureId , courseId } = req.params

       const [checkEnrollLecture, checkCourseEnroll] = await Promise.all([

            await this.EnrollmentModel.findOne({
                filter:{
                    LectureId: Types.ObjectId.createFromHexString(LectureId!),
                    UserId:req.user?._id,
                }
            }),

            await this.EnrollmentModel.findOne({
                filter:{
                    courseId: Types.ObjectId.createFromHexString(courseId!),
                    UserId:req.user?._id,
                }
            }),

       ])

       if(!checkEnrollLecture && !checkCourseEnroll){
             throw new ConflictException("You are not enrolled in this Lecture or the Course")
       }

        const Lecture = await this.LectureModel.findOneAndupdate({
            filter: {
                _id: LectureId,
            },
            update:{
                $addToSet: { viewedByUsers: req.user?._id }   
            }
        })

        if (!Lecture) {
            throw new NotFoundException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: Lecture });
    }


     GetLecturebyCourseName = async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body

        const Course = await this.CourseModel.findOne({
            filter: {
                name
            },
        })

        if(!Course){
            throw new NotFoundException("No course found matching criteria");
        }

        const Lecture = await this.LectureModel.find({
            filter: {
                CourseId: Course._id,
            },
        })

        if (!Lecture) {
            throw new NotFoundException("No course found matching criteria");
        }

        return SuccesResponse({ res, data: Lecture });
    }
}
export default new lectureService