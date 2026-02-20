import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { TYPES } from "../types";
import { EventRepository } from "../modules/event/event.repository";
import { ApiError, ResponseHandler } from "../utils";
import { StatusCodes } from "http-status-codes";
import { EventStatus } from "../generated/prisma/client";

@injectable()
export class EventGuard {
    constructor(
        @inject(TYPES.EventRepository) private eventRepository: EventRepository
    ) { }

    /**
     * Ensures the user is a registered participant of the event.
     */
    participantOnly = async (req: any, res: Response, next: NextFunction) => {
        try {
            const eventId = req.params.id || req.body.eventId;
            const userId = req.user.id;

            if (!eventId) {
                return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Event ID is required");
            }

            const participant = await this.eventRepository.findParticipant(eventId, userId);
            if (!participant) {
                return ResponseHandler.sendError(res, StatusCodes.FORBIDDEN, "You must be registered for this event to perform this action.");
            }

            req.participant = participant;
            next();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Ensures the contest is currently ongoing.
     */
    ongoingOnly = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = req.params.id || req.body.eventId;
            if (!eventId) {
                return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Event ID is required");
            }

            const event = await this.eventRepository.findById(eventId);
            if (!event) {
                return ResponseHandler.sendError(res, StatusCodes.NOT_FOUND, "Event not found");
            }

            const now = new Date();
            const start = new Date(event.startsAt);
            const end = new Date(event.endsAt);

            if (now < start) {
                return ResponseHandler.sendError(res, StatusCodes.FORBIDDEN, "This event has not started yet.");
            }

            if (now > end) {
                return ResponseHandler.sendError(res, StatusCodes.FORBIDDEN, "This event has already ended.");
            }

            // Also check status if backend updates it automatically
            if (event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED) {
                return ResponseHandler.sendError(res, StatusCodes.FORBIDDEN, `Event is ${event.status.toLowerCase()}.`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
