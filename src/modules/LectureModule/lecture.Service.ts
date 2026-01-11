import type { Response, Request, NextFunction } from "express"
import { parseISODuration } from "../Utilis/Duration";
import { LectureModel } from "../../Schema/lecture";
import { LectureRepositry } from "../Utilis/DatabasePattern/lectureReposatory";
import { BadRequestException } from "../Utilis/response/ErrorResponse";
import { SuccesResponse } from "../Utilis/response/SucessResponse";

class lectureService {
    private readonly LectureModel = new LectureRepositry(LectureModel)
    constructor() { }

    private async fetchYouTubeMetadata(videoId: string) {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.items?.length) {
            throw new Error('Video not found');
        }

        const item = data.items[0];
        const durationISO = item.contentDetails.duration; // "PT1H2M30S"
        const durationSeconds = parseISODuration(durationISO);

        return {
            title: item.snippet.title,
            description: item.snippet.description,
            durationSeconds,
        };
    }

    createleacture = async (req: Request, res: Response, next: NextFunction) => {
        const { videoUrl } = req.body
        console.log(videoUrl)
        const [checkLecture, lecutreData] = await Promise.all([
            this.LectureModel.findOneAndDelete({ filter: { videoUrl } }),
            this.fetchYouTubeMetadata(videoUrl)
        ]);
        const [lecture] = await this.LectureModel.create({
            data: [
                {
                    videoUrl,
                    title: lecutreData.title,
                    description: lecutreData.description,
                    duration: lecutreData.durationSeconds,
                    createdBy: req.user?._id!,
                }
            ]
        }) || []
        if (!lecture) {
            throw new BadRequestException("sorry failed to create the lecture")
        }
        return SuccesResponse({ res, data: { lecture } })
    }

    Freezeleacture = async (req: Request, res: Response, next: NextFunction) => {
        const { videoUrl } = req.body
    
        const lecture = await this.LectureModel.findOneAndupdate({
            filter:{
                videoUrl,
                DeletedAt:{$exists:false},
            },
            update:{
                DeletedAt: new Date(),
                DeletedBy: req.user?._id,
                $unset: { RestoredAt: 1, RestoredBy: 1 }
            }
        })
        if (!lecture) {
            throw new BadRequestException("sorry failed to create the lecture")
        }
        return SuccesResponse({ res, data: { lecture } })
    }

    Restoreleacture = async (req: Request, res: Response, next: NextFunction) => {
        const { videoUrl } = req.body
    
        const lecture = await this.LectureModel.findOneAndupdate({
            filter:{
                videoUrl,
                DeletedAt:{$exists:true},
            },
            update:{
                RestoredAt: new Date(),
                RestoredBy: req.user?._id,
                $unset: { DeletedAt: 1, DeletedBy: 1 }
            }
        })
        if (!lecture) {
            throw new BadRequestException("sorry failed to create the lecture")
        }
        return SuccesResponse({ res, data: { lecture } })
    }

    Deleteleacture = async (req: Request, res: Response, next: NextFunction) => {
        const { videoUrl } = req.body
    
        const lecture = await this.LectureModel.findOneAndDelete({
            filter:{
                videoUrl,
                DeletedAt:{$exists:true},
            }
        })
        if (!lecture) {
            throw new BadRequestException("sorry failed to create the lecture")
        }
        return SuccesResponse({ res, data: { lecture } })
    } 
}
export default new lectureService