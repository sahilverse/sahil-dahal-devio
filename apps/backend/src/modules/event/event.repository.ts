import { injectable, inject } from "inversify";
import { PrismaClient, Event, Prisma, EventStatus, EventType, EventParticipant, ParticipantStatus, EventVisibility } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class EventRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    private getEventInclude(currentUserId?: string) {
        return {
            createdBy: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                },
            },
            community: {
                select: {
                    id: true,
                    name: true,
                    iconUrl: true,
                },
            },
            _count: {
                select: {
                    participants: true,
                },
            },
            ...(currentUserId && {
                participants: {
                    where: { userId: currentUserId },
                },
            }),
        };
    }

    async create(data: Prisma.EventCreateInput): Promise<Event> {
        return this.prisma.event.create({
            data,
            include: this.getEventInclude(),
        });
    }

    async findById(id: string, currentUserId?: string): Promise<any | null> {
        return this.prisma.event.findUnique({
            where: { id },
            include: this.getEventInclude(currentUserId),
        });
    }

    async findBySlug(slug: string, currentUserId?: string): Promise<any | null> {
        return this.prisma.event.findUnique({
            where: { slug },
            include: this.getEventInclude(currentUserId),
        });
    }

    async findProblems(eventId: string) {
        return this.prisma.eventProblem.findMany({
            where: { eventId },
            include: {
                problem: true,
            },
            orderBy: { order: "asc" },
        });
    }

    async findPrizes(eventId: string) {
        return this.prisma.eventPrize.findMany({
            where: { eventId },
            orderBy: { rankFrom: "asc" },
        });
    }

    async findRules(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { rules: true },
        });
        return event?.rules || [];
    }

    async findMany(params: {
        cursor?: string;
        limit: number;
        status?: EventStatus;
        type?: EventType;
        communityId?: string;
        currentUserId?: string;
        isApproved?: boolean;
        visibility?: EventVisibility;
        startsAt?: Prisma.DateTimeFilter;
        endsAt?: Prisma.DateTimeFilter;
        OR?: Prisma.EventWhereInput[];
    }): Promise<Event[]> {
        const { cursor, limit, status, type, communityId, currentUserId, isApproved, visibility, startsAt, endsAt, OR } = params;

        return this.prisma.event.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: {
                ...(status && { status }),
                ...(type && { type }),
                ...(communityId && { communityId }),
                ...(isApproved !== undefined && { isApproved }),
                ...(visibility && { visibility }),
                ...(startsAt && { startsAt }),
                ...(endsAt && { endsAt }),
                ...(OR && { OR }),
            },
            orderBy: { startsAt: "asc" },
            include: this.getEventInclude(currentUserId),
        });
    }

    async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
        return this.prisma.event.update({
            where: { id },
            data,
            include: this.getEventInclude(),
        });
    }

    async delete(id: string): Promise<Event> {
        return this.prisma.event.delete({
            where: { id },
        });
    }

    // Participation
    async registerParticipant(eventId: string, userId: string, data?: any): Promise<EventParticipant> {
        return this.prisma.eventParticipant.create({
            data: {
                eventId,
                userId,
                ...data,
            },
        });
    }

    async findParticipant(eventId: string, userId: string): Promise<EventParticipant | null> {
        return this.prisma.eventParticipant.findUnique({
            where: { eventId_userId: { eventId, userId } },
        });
    }

    async updateParticipantStatus(eventId: string, userId: string, status: ParticipantStatus): Promise<EventParticipant> {
        return this.prisma.eventParticipant.update({
            where: { eventId_userId: { eventId, userId } },
            data: { status },
        });
    }

    async getParticipants(eventId: string, limit: number = 20, cursor?: string): Promise<EventParticipant[]> {
        return this.prisma.eventParticipant.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { score: "desc" },
        });
    }

    async getLeaderboard(eventId: string, limit: number = 50): Promise<EventParticipant[]> {
        return this.prisma.eventParticipant.findMany({
            take: limit,
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: [
                { score: "desc" },
                { registeredAt: "asc" },
            ],
        });
    }

    // Problems
    async addProblem(eventId: string, problemId: string, points: number, order: number): Promise<void> {
        await this.prisma.eventProblem.create({
            data: {
                eventId,
                problemId,
                points,
                order,
            },
        });
    }

    async removeProblem(eventId: string, problemId: string): Promise<void> {
        await this.prisma.eventProblem.delete({
            where: {
                eventId_problemId: {
                    eventId,
                    problemId,
                },
            },
        });
    }

    async updateProblemOrder(eventId: string, problemId: string, order: number): Promise<void> {
        await this.prisma.eventProblem.update({
            where: {
                eventId_problemId: {
                    eventId,
                    problemId,
                },
            },
            data: { order },
        });
    }

    async findActiveEventsForProblem(problemId: string): Promise<any[]> {
        const now = new Date();
        return this.prisma.event.findMany({
            where: {
                problems: {
                    some: { problemId }
                },
                startsAt: { lte: now },
                endsAt: { gte: now },
                status: EventStatus.ONGOING,
            },
            select: {
                id: true,
                title: true,
                type: true,
            }
        });
    }
}
