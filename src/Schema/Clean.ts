import { HydratedDocument, model, Schema, Types } from "mongoose";

/** What to purge — worker resolves related docs from `rootId` (no giant id arrays). */
export enum CleanJobKind {
    course = "course",
    section = "section",
    lecture = "lecture",
    exam = "exam",
    book = "book",
    User = "User",
}

export enum CleanJobStatus {
    pending = "pending",
    processing = "processing",
    done = "done",
    failed = "failed",
}

export interface ICleanJob {
    kind: CleanJobKind;
    rootId: Types.ObjectId;
    status: CleanJobStatus;
    requestedBy?: Types.ObjectId;
    error?: string;
    processedAt?: Date;
}

const CleanJobSchema = new Schema<ICleanJob>(
    {
        kind: {
            type: String,
            enum: Object.values(CleanJobKind),
            required: true,
            index: true,
        },
        rootId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(CleanJobStatus),
            required: true,
            default: CleanJobStatus.pending,
            index: true,
        },
        requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
        error: { type: String, maxlength: 2000 },
        processedAt: { type: Date },
    },
    { timestamps: true }
);

CleanJobSchema.index({ status: 1, createdAt: 1 });

export type CleanJobHydratedDocument = HydratedDocument<ICleanJob>;

/** One document = one queued hard-delete job (many rows in this collection over time). */
export const CleanModel = model<ICleanJob>("Clean", CleanJobSchema);
