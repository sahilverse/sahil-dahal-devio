import { z } from "zod";

export enum PostType {
    TEXT = "TEXT",
    LINK = "LINK",
    QUESTION = "QUESTION",
    POLL = "POLL",
}

export enum PostStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

const fileSchema = z.custom<any>((val) => {
    return val && typeof val === 'object' && 'fieldname' in val;
}, "Invalid file");

const basePostSchema = z.object({
    title: z.string().min(1, "Title is required").max(300, "Title must be less than 300 characters").trim(),
    content: z.string().optional(),
    communityId: z.cuid().optional(),
    topics: z.array(z.string().trim().min(1).max(50)).max(5, "Maximum 5 topics allowed").optional(),
    status: z.enum(PostStatus).optional(),
});

export const createPostSchema = z.discriminatedUnion("type", [
    basePostSchema.extend({
        type: z.literal(PostType.TEXT),
        media: z.array(fileSchema).max(5, "Maximum 5 media files allowed").optional(),
        bountyAmount: z.never("Bounty is not allowed for Text posts").optional(),
    }).strict(),
    basePostSchema.extend({
        type: z.literal(PostType.LINK),
        linkUrl: z.url("Invalid URL").nonempty("Link URL is required"),
        media: z.array(fileSchema).max(0, "Media is not allowed for Link posts").optional(),
        bountyAmount: z.never("Bounty is not allowed for Link posts").optional(),
    }).strict(),
    basePostSchema.extend({
        type: z.literal(PostType.QUESTION),
        bountyAmount: z.number().int().min(0).optional(),
        media: z.array(fileSchema).max(5, "Maximum 5 media files allowed").optional(),
    }).strict(),
    basePostSchema.extend({
        type: z.literal(PostType.POLL),
        pollOptions: z.array(z.string().trim().min(1)).min(2, "At least 2 options are required").max(10, "Maximum 10 options allowed"),
        media: z.array(fileSchema).max(0, "Media is not allowed for Poll posts").optional(),
        bountyAmount: z.never("Bounty is not allowed for Poll posts").optional(),
    }).strict(),
]);


export const frontendPostSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(PostType.TEXT),
        title: z.string().min(1, "Title is required").max(300),
        content: z.string().optional(),
        communityId: z.cuid().optional(),
        topics: z.array(z.string()).max(5).optional(),
        status: z.enum([PostStatus.PUBLISHED, PostStatus.DRAFT] as any),
        visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
        media: z.array(z.instanceof(File)).max(10).optional(),
    }),
    z.object({
        type: z.literal(PostType.LINK),
        title: z.string().min(1, "Title is required").max(300),
        linkUrl: z.url("Invalid URL"),
        communityId: z.cuid().optional(),
        topics: z.array(z.string()).max(5).optional(),
        status: z.enum([PostStatus.PUBLISHED, PostStatus.DRAFT] as any),
        visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
    }),
    z.object({
        type: z.literal(PostType.QUESTION),
        title: z.string().min(1, "Title is required").max(300),
        content: z.string().optional(),
        communityId: z.cuid().optional(),
        topics: z.array(z.string()).max(5).optional(),
        status: z.enum([PostStatus.PUBLISHED, PostStatus.DRAFT] as any),
        visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
        bountyAmount: z.number().int().min(0).optional(),
        media: z.array(z.instanceof(File)).max(10).optional(),
    }),
]);

export type CreatePostFormData = z.infer<typeof frontendPostSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
