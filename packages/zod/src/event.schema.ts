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

export enum ParticipantStatus {
    REGISTERED = "REGISTERED",
    CHECKED_IN = "CHECKED_IN",
    COMPLETED = "COMPLETED",
    DISQUALIFIED = "DISQUALIFIED",
}

export const createEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
    description: z.string().min(1, "Description is required"),
    type: z.nativeEnum(EventType),
    communityId: z.string().cuid().optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    minAuraPoints: z.number().int().min(0).default(0),
    entryCipherCost: z.number().int().min(0).default(0),
    maxParticipants: z.number().int().min(1).optional(),
    participationAura: z.number().int().min(0).default(0),
    imageUrl: z.string().url().optional().or(z.literal("")),
    requiresTeam: z.boolean().default(false),
    teamSize: z.number().int().min(1).optional(),
    externalUrl: z.string().url().optional().or(z.literal("")),
}).refine(data => new Date(data.startsAt) < new Date(data.endsAt), {
    message: "End date must be after start date",
    path: ["endsAt"],
});

export const updateEventSchema = createEventSchema.partial().extend({
    status: z.nativeEnum(EventStatus).optional(),
});

export const eventRegistrationSchema = z.object({
    teamName: z.string().min(1).max(100).optional(),
    members: z.array(z.string().cuid()).optional(), // For team events
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
