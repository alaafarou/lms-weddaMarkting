import { z } from "zod";

export const createLectureValidation = {
    body: z.object({
        videoUrl: z
            .string()
            .url('Must be a valid URL')
            .refine(
                (val) => {
                    const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                    return regex.test(val);
                },
                { message: 'Invalid YouTube URL format' }
            )
            .transform((url) => {
                // Extract and return ONLY the video ID
                const match = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                return match ? match[1] : url;
            }),
    }),
};
