import cron, { type ScheduledTask } from "node-cron";
import { CleanJobKind, CleanJobStatus, CleanModel } from "../Schema/Clean";
import { CourseRepositry } from "../modules/Utilis/DatabasePattern/CourseReposatory";
import { CourseModel } from "../Schema/Course";
import { SectionRepositry } from "../modules/Utilis/DatabasePattern/SectionReposatory";
import { SectionModel } from "../Schema/Section";
import { LectureRepositry } from "../modules/Utilis/DatabasePattern/lectureReposatory";
import { LectureModel } from "../Schema/lecture";
import { ExamRepositry } from "../modules/Utilis/DatabasePattern/ExamReposatory";
import { ExamHydratedDocument, ExamModule } from "../Schema/Exam";
import { CodeModel } from "../Schema/Code";
import { CodeRepositry } from "../modules/Utilis/DatabasePattern/CodeRepo";
import { SubmissionReposatory } from "../modules/Utilis/DatabasePattern/SubmitExamResposatory";
import { EnrollmentRepositry } from "../modules/Utilis/DatabasePattern/EnrollmentRepo";
import { QuestionRepositry } from "../modules/Utilis/DatabasePattern/QuestionsReposatry";
import { SubmissionModel } from "../Schema/Submition";
import { QuestionModel } from "../Schema/Questions";
import { EnrollmentModel } from "../Schema/Enrollment";
import { Types } from "mongoose";

/**
 * Every day at 03:00 server local time. Set `CRON_TZ` in env (e.g. `Africa/Cairo`) if the host
 * timezone is not where your users are.
 */
const SCHEDULE_THREE_AM = "0 3 * * *";
let scheduledTask: ScheduledTask | null = null;

class CleanService {
    private readonly CourseModel: CourseRepositry = new CourseRepositry(CourseModel);
    private readonly SectionModel: SectionRepositry = new SectionRepositry(SectionModel);
    private readonly LectureModel: LectureRepositry = new LectureRepositry(LectureModel);
    private readonly ExamModel: ExamRepositry = new ExamRepositry(ExamModule);
    private readonly EnrollmentModel: EnrollmentRepositry = new EnrollmentRepositry(EnrollmentModel);
    private readonly SubmissionModel: SubmissionReposatory = new SubmissionReposatory(SubmissionModel);
    private readonly QuestionModel: QuestionRepositry = new QuestionRepositry(QuestionModel);
    private readonly CodeModel: CodeRepositry = new CodeRepositry(CodeModel);

    /** Enrollment + codes tied to these lectures, then lecture rows. */
    private async deleteLectureArtifactsAndLectures(filter: Record<string, unknown>): Promise<void> {
        const lectures = await this.LectureModel.find({ filter });
        const ids = lectures.map((l) => l._id);
        if (ids.length > 0) {
            await this.EnrollmentModel.deleteMany({
                filter: { LectureId: { $in: ids } },
            });
            await this.CodeModel.deleteMany({
                filter: { lectureId: { $in: ids } },
            });
        }
        await this.LectureModel.deleteMany({ filter });
    }

    private async deleteLecture(args: {
        courseId?: Types.ObjectId;
        sectionId?: Types.ObjectId;
        lectureId?: Types.ObjectId;
    }): Promise<void> {
        const { courseId, sectionId, lectureId } = args;
        let filter: Record<string, unknown> = {};
        if (lectureId) {
            filter._id = lectureId;
        } else if (courseId) {
            filter.CourseId = courseId;
        } else if (sectionId) {
            filter.SectionId = sectionId;
        }
        await this.deleteLectureArtifactsAndLectures(filter);
    }

    /** Submissions + questions first, then exam document(s). */
    private async deleteSubmissionsQuestionsAndExams(exams: ExamHydratedDocument[]): Promise<void> {
        for (const exam of exams) {
            await Promise.all([
                this.SubmissionModel.deleteMany({
                    filter: { Exam: exam._id },
                }),
                this.QuestionModel.deleteMany({
                    filter: { ExamID: exam._id },
                }),
            ]);
            await this.ExamModel.findOneAndDelete({
                filter: { _id: exam._id },
            });
        }
    }

    private async deleteUser({Student_id}: {Student_id: Types.ObjectId}): Promise<void> {
        await Promise.all([
            this.SubmissionModel.deleteMany({
                filter: { Student: Student_id },
            }),

            this.EnrollmentModel.deleteMany({
                filter: { UserId:Student_id },
            }),

            this.CodeModel.deleteMany({
                filter: { Usedby: Student_id },
            }),
        ]);
    }



    private async deleteExam(args: {
        courseId?: Types.ObjectId;
        sectionId?: Types.ObjectId;
        examId?: Types.ObjectId;
    }): Promise<void> {
        const { courseId, sectionId, examId } = args;
        const filter: Record<string, unknown> = {};
        if (examId) {
            filter._id = examId;
        } else if (sectionId) {
            filter.SectionID = sectionId;
        } else if (courseId) {
            filter.CourseID = courseId;
        }

        const exams = await this.ExamModel.find({ filter });
        await this.deleteSubmissionsQuestionsAndExams(exams);
    }

    private async deleteSection(args: { sectionId?: Types.ObjectId; courseId?: Types.ObjectId }): Promise<void> {
        const { sectionId, courseId } = args;
        if (courseId) {
            await this.SectionModel.deleteMany({
                filter: { courseId },
            });
        } else if (sectionId) {
            await this.SectionModel.deleteMany({
                filter: { _id: sectionId },
            });
        }
    }

    /** Last step for a course purge: course-level enrollments + course-level codes + course row. */
    private async deleteCourseDocument(courseId: Types.ObjectId): Promise<void> {
        await this.EnrollmentModel.deleteMany({
            filter: { courseId },
        });
        await this.CodeModel.deleteMany({
            filter: { CourseId: courseId },
        });
        await this.CourseModel.deleteMany({
            filter: { _id: courseId },
        });
    }

    private async runCoursePurge(rootId: Types.ObjectId): Promise<void> {
        await Promise.all([this.deleteLecture({ courseId: rootId }), this.deleteExam({ courseId: rootId })]);
        await this.deleteSection({ courseId: rootId });
        await this.deleteCourseDocument(rootId);
    }

    private async runSectionPurge(rootId: Types.ObjectId): Promise<void> {
        await Promise.all([this.deleteLecture({ sectionId: rootId }), this.deleteExam({ sectionId: rootId })]);
        await this.deleteSection({ sectionId: rootId });
    }

    /**
     * Atomically claim pending → processing. Returns null if another worker claimed or job missing.
     */
    private async claimJob(jobId: Types.ObjectId) {
        return CleanModel.findOneAndUpdate(
            { _id: jobId, status: CleanJobStatus.pending },
            { $set: { status: CleanJobStatus.processing } },
            { new: true }
        );
    }

    private async processJob(jobId: Types.ObjectId): Promise<void> {
        const job = await this.claimJob(jobId);
        if (!job) {
            return;
        }

        try {
            switch (job.kind) {
                case CleanJobKind.course:
                    await this.runCoursePurge(job.rootId);
                    break;
                case CleanJobKind.section:
                    await this.runSectionPurge(job.rootId);
                    break;
                case CleanJobKind.exam:
                    await this.deleteExam({ examId: job.rootId });
                    break;
                case CleanJobKind.lecture:
                    await this.deleteLecture({ lectureId: job.rootId });
                    break;
                case CleanJobKind.User:
                    await this.deleteUser({ Student_id: job.rootId });
                    break;
                default:
                    throw new Error(`Unknown CleanJobKind: ${job.kind}`);
            }

            await CleanModel.updateOne(
                { _id: job._id },
                {
                    $set: { status: CleanJobStatus.done, processedAt: new Date() },
                    $unset: { error: "" },
                }
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            await CleanModel.updateOne(
                { _id: job._id },
                {
                    $set: {
                        status: CleanJobStatus.failed,
                        error: message.slice(0, 2000),
                    },
                }
            );
            throw err;
        }
    }

    async runPendingCleanJobsOnce(): Promise<void> {
        const pending = await CleanModel.find({ status: CleanJobStatus.pending })
            .sort({ createdAt: 1 })
            .limit(25)
            .lean();

        if (pending.length === 0) {
            return;
        }

        console.log(`[cleanJobsCron] processing ${pending.length} pending job(s)`);

        for (const job of pending) {
            try {
                await this.processJob(job._id as Types.ObjectId);
            } catch {
                // already marked failed in processJob
            }
        }
    }
}

const cleanService = new CleanService();

export function startCleanJobsCron(): void {
    if (scheduledTask) {
        return;
    }
    const options = process.env.CRON_TZ ? { timezone: process.env.CRON_TZ } : undefined;
    scheduledTask = cron.schedule(
        SCHEDULE_THREE_AM,
        async () => {
            try {
                await cleanService.runPendingCleanJobsOnce();
            } catch (e) {
                console.error("[cleanJobsCron] run failed", e);
            }
        },
        options
    );
    console.log("[cleanJobsCron] scheduled daily at 03:00 (set CRON_TZ for IANA timezone if needed)");
}

export function stopCleanJobsCron(): void {
    scheduledTask?.stop();
    scheduledTask = null;
}
