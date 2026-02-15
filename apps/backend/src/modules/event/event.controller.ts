import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { EventService } from "./event.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import { EventResponseDto, GetEventsDto, EventParticipantDto } from "./event.dto";

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
}
