import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { EventService } from "./event.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import { EventResponseDto, GetEventsDto, EventParticipantDto, EventPrizeDto, EventProblemDto } from "./event.dto";

@injectable()
export class EventController {
    constructor(@inject(TYPES.EventService) private eventService: EventService) { }

    createEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const body = req.body;
        const event = await this.eventService.createEvent(userId, body);
        const result = plainToInstance(EventResponseDto, event, { excludeExtraneousValues: true });
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Event created successfully", result);
    });

    getEvents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const query = plainToInstance(GetEventsDto, req.query, { excludeExtraneousValues: true });
        const currentUserId = req.user?.id;

        const { events, nextCursor } = await this.eventService.getEvents({
            ...query,
            currentUserId,
        });

        const result = {
            events: plainToInstance(EventResponseDto, events, { excludeExtraneousValues: true, currentUserId } as any),
            nextCursor,
        };

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Events fetched successfully", result);
    });

    getEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const currentUserId = req.user?.id;
        const event = await this.eventService.getEventById(id, currentUserId);
        const result = plainToInstance(EventResponseDto, event, { excludeExtraneousValues: true, currentUserId } as any);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event fetched successfully", result);
    });

    updateEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const body = req.body;
        const event = await this.eventService.updateEvent(id, userId, body);
        const result = plainToInstance(EventResponseDto, event, { excludeExtraneousValues: true });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event updated successfully", result);
    });

    registerForEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const body = req.body;
        const participant = await this.eventService.registerForEvent(id, userId, body);
        const result = plainToInstance(EventParticipantDto, participant, { excludeExtraneousValues: true });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Successfully registered for event", result);
    });

    getLeaderboard = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const leaderboard = await this.eventService.getLeaderboard(id);
        const result = plainToInstance(EventParticipantDto, leaderboard, { excludeExtraneousValues: true });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Leaderboard fetched successfully", result);
    });

    uploadImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const file = req.file;

        if (!file) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "No file uploaded");
        }

        const imageUrl = await this.eventService.uploadEventImage(id, userId, file);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event image uploaded successfully", { imageUrl });
    });

    removeImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await this.eventService.removeEventImage(id, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event image removed successfully");
    });

    addEventProblem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const { problemId, points, order } = req.body;

        await this.eventService.addEventProblem(id, userId, problemId, points, order);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Problem added to event successfully");
    });

    removeEventProblem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id, problemId } = req.params as { id: string; problemId: string };

        await this.eventService.removeEventProblem(id, userId, problemId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Problem removed from event successfully");
    });

    getEventPrizes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const prizes = await this.eventService.getEventPrizes(id);
        const result = plainToInstance(EventPrizeDto, prizes, { excludeExtraneousValues: true });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event prizes fetched successfully", result);
    });

    getEventRules = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const rules = await this.eventService.getEventRules(id);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event rules fetched successfully", rules);
    });

    getEventProblems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const currentUserId = req.user?.id;
        const problems = await this.eventService.getEventProblems(id, currentUserId);
        const result = plainToInstance(EventProblemDto, problems, { excludeExtraneousValues: true });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Event problems fetched successfully", result);
    });

    getAdminParticipants = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const userId = req.user!.id;
        const participants = await this.eventService.getAdminParticipants(id, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Admin participant list fetched successfully", participants);
    });

    updateManualScore = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const { userId: participantUserId, score } = req.body;
        const moderatorId = req.user!.id;
        const updated = await this.eventService.updateManualScore(id, moderatorId, participantUserId, score);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Participant score updated successfully", updated);
    });

    removeParticipantMod = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id, userId: participantUserId } = req.params as { id: string; userId: string };
        const moderatorId = req.user!.id;
        await this.eventService.removeParticipantMod(id, moderatorId, participantUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Participant removed successfully");
    });

    updateParticipantStatusMod = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id, userId: participantUserId } = req.params as { id: string; userId: string };
        const { status } = req.body;
        const moderatorId = req.user!.id;
        const updated = await this.eventService.updateParticipantStatusMod(id, moderatorId, participantUserId, status as any);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Participant status updated successfully", updated);
    });
}
