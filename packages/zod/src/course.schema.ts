import { z } from "zod";
import { providers } from "./payment.schema";

// ─── Course CRUD ───────────────────────────────────────

export const createCourseSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
    description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters").trim(),
    price: z.number().min(0, "Price cannot be negative").default(0),
    isFree: z.boolean().default(false),
    maxCipherDiscount: z.number().int().min(0).optional(),
    isPublished: z.boolean().default(false),
    topics: z.array(z.string().trim().min(1).max(50)).max(10, "Maximum 10 topics allowed").optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().min(1).max(5000).trim().optional(),
    price: z.number().min(0).optional(),
    isFree: z.boolean().optional(),
    maxCipherDiscount: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
    topics: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ─── Course Module (Section) ───────────────────────────

export const createModuleSchema = z.object({
    title: z.string().min(1, "Module title is required").max(200).trim(),
    order: z.number().int().min(0).optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

export const updateModuleSchema = z.object({
    title: z.string().min(1).max(200).trim().optional(),
    order: z.number().int().min(0).optional(),
});

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// ─── Lesson ────────────────────────────────────────────

export const createLessonSchema = z.object({
    title: z.string().min(1, "Lesson title is required").max(200).trim(),
    content: z.string().max(50000).optional(),
    videoUrl: z.url("Invalid video URL").optional(),
    duration: z.number().int().min(0).optional(),
    order: z.number().int().min(0).optional(),
    isPreview: z.boolean().default(false),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = z.object({
    title: z.string().min(1).max(200).trim().optional(),
    content: z.string().max(50000).optional(),
    videoUrl: z.string().url("Invalid video URL").optional().nullable(),
    duration: z.number().int().min(0).optional(),
    order: z.number().int().min(0).optional(),
    isPreview: z.boolean().optional(),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

// ─── Enrollment ────────────────────────────────────────

export const enrollCourseSchema = z.object({
    useCipherCoins: z.boolean().default(false),
    cipherAmount: z.number().int().min(0).optional(),
    promoCode: z.string().optional(),
    provider: z.enum(providers).optional(),
});

export type EnrollCourseInput = z.infer<typeof enrollCourseSchema>;

// ─── Review ────────────────────────────────────────────

export const createReviewSchema = z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().max(2000, "Comment must be less than 2000 characters").trim().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).trim().optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

// ─── Query Filters ─────────────────────────────────────

export const courseQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    topic: z.string().optional(),
    isFree: z.string().transform(v => v === "true").optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["NEWEST", "POPULAR", "PRICE_LOW", "PRICE_HIGH"]).default("NEWEST"),
});

export type CourseQueryInput = z.infer<typeof courseQuerySchema>;

export const moduleQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ModuleQueryInput = z.infer<typeof moduleQuerySchema>;

export const lessonQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type LessonQueryInput = z.infer<typeof lessonQuerySchema>;
