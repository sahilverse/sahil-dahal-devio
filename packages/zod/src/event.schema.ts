import { z } from "zod";

export enum EventType {
    HACKATHON = "HACKATHON",
    CTF = "CTF",
    CONTEST = "CONTEST",
    WORKSHOP = "WORKSHOP",
    MEETUP = "MEETUP",
}

export enum EventStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    PUBLISHED = "PUBLISHED",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export enum EventVisibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    UNLISTED = "UNLISTED",
}

export enum ParticipantStatus {
    REGISTERED = "REGISTERED",
    CHECKED_IN = "CHECKED_IN",
    COMPLETED = "COMPLETED",
    DISQUALIFIED = "DISQUALIFIED",
}

export const createEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").trim(),
    description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters").trim(),
    type: z.enum(EventType),
    communityId: z.cuid("Please select a community for this event"),
    startsAt: z.string().min(1, "Start date is required"),
    endsAt: z.string().min(1, "End date is required"),
    registrationDeadline: z.string().optional(),
    minAuraPoints: z.preprocess((v) => (v === "" || v === undefined ? 0 : Number(v)), z.number().int().min(0)).default(0),
    entryCipherCost: z.preprocess((v) => (v === "" || v === undefined ? 0 : Number(v)), z.number().int().min(0)).default(0),
    maxParticipants: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().min(1).optional()),
    participationAura: z.preprocess((v) => (v === "" || v === undefined ? 0 : Number(v)), z.number().int().min(0)).default(0),
    imageUrl: z.url().optional().or(z.literal("")),
    requiresTeam: z.boolean().default(false),
    teamSize: z.number().int().min(1).optional(),
    externalUrl: z.url().optional().or(z.literal("")),
    rules: z.array(z.string()).default([]),
    prizes: z.array(z.object({
        rank: z.number().int().min(1),
        prize: z.string().min(1),
        description: z.string().default(""),
    })).default([]),
    status: z.enum(EventStatus).default(EventStatus.DRAFT),
    visibility: z.enum(EventVisibility).default(EventVisibility.PUBLIC),
}).refine(data => new Date(data.startsAt) < new Date(data.endsAt), {
    message: "End date must be after start date",
    path: ["endsAt"],
});

export const updateEventSchema = createEventSchema.partial().extend({
    status: z.nativeEnum(EventStatus).optional(),
    visibility: z.nativeEnum(EventVisibility).optional(),
});

export const eventRegistrationSchema = z.object({
    teamName: z.string().min(1).max(100).optional(),
    members: z.array(z.cuid()).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;

export const addEventProblemSchema = z.object({
    problemId: z.string().cuid("Invalid problem ID"),
    points: z.number().int().min(0).default(0),
    order: z.number().int().default(0),
});

export type AddEventProblemInput = z.infer<typeof addEventProblemSchema>;
