import z from "zod";



export const CreateLmsValidation = {
    body: z.strictObject({

        Name: z.string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name too long"),


        DB_Name: z.string()
            .min(2, "DB_Name must be at least 2 characters")
            .max(50, "DB_Name too long"),


        Host: z.array(
            z.string()
                .regex(
                    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
                    "Invalid host format"
                )
        ).length(2, {
            message: "Host requires exactly 2 domains: main.com and admin.main.com"
        })
    })
}






