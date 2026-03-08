import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CyberRoomRepository } from "./cyber-room.repository";
import { CipherService } from "../cipher/cipher.service";
import { VMSessionResponseDto } from "./cyber-room.dto";
import { ApiError, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import { addMinutes } from "date-fns";
import { CipherReason } from "../../generated/prisma/client";

const BASE_SESSION_MINUTES = 30;
const EXTENSION_MINUTES = 30;
const EXTENSION_COST = 50; // 50 Ciphers for 30 mins

@injectable()
export class VMSessionService {
    constructor(
        @inject(TYPES.CyberRoomRepository) private cyberRoomRepository: CyberRoomRepository,
        @inject(TYPES.CipherService) private cipherService: CipherService
    ) { }

    async startSession(userId: string, roomId: string): Promise<VMSessionResponseDto> {
        // Check for active session
        const activeSession = await this.cyberRoomRepository.findActiveSession(userId, roomId);
        if (activeSession) {
            return plainToInstance(VMSessionResponseDto, activeSession, { excludeExtraneousValues: true });
        }

        // TODO: Call Lab Orchestrator to provision machine
        // const instance = await this.orchestrator.provision(...)

        const expiresAt = addMinutes(new Date(), BASE_SESSION_MINUTES);

        const session = await this.cyberRoomRepository.createSession({
            user: { connect: { id: userId } },
            room: { connect: { id: roomId } },
            status: "RUNNING",
            expiresAt,
            startedAt: new Date(),
            // instanceId: instance.id,
            // ipAddress: instance.ip
        });

        logger.info(`Started VM session ${session.id} for user ${userId} in room ${roomId}. Expires at ${expiresAt}`);

        return plainToInstance(VMSessionResponseDto, session, { excludeExtraneousValues: true });
    }

    async extendSession(sessionId: string, userId: string): Promise<VMSessionResponseDto> {
        const session = await this.cyberRoomRepository.findSessionById(sessionId);
        if (!session || session.userId !== userId || session.status !== "RUNNING") {
            throw new ApiError("Active session not found", StatusCodes.NOT_FOUND);
        }

        // Deduct Cipher
        try {
            await this.cipherService.spendCipher(
                userId,
                EXTENSION_COST,
                CipherReason.LAB_TIME_EXTENSION,
                sessionId
            );
        } catch (error: any) {
            throw new ApiError(error.message || "Failed to extend session", StatusCodes.BAD_REQUEST);
        }

        // Extend expiresAt
        const newExpiresAt = addMinutes(session.expiresAt, EXTENSION_MINUTES);
        const updatedSession = await this.cyberRoomRepository.updateSession(sessionId, {
            expiresAt: newExpiresAt
        });

        logger.info(`Extended VM session ${sessionId} for user ${userId}. New expiry: ${newExpiresAt}`);

        return plainToInstance(VMSessionResponseDto, updatedSession, { excludeExtraneousValues: true });
    }

    async terminateSession(sessionId: string, userId: string): Promise<void> {
        const session = await this.cyberRoomRepository.findSessionById(sessionId);
        if (!session || session.userId !== userId) {
            throw new ApiError("Session not found", StatusCodes.NOT_FOUND);
        }

        // TODO: Call Lab Orchestrator to kill machine

        await this.cyberRoomRepository.updateSession(sessionId, {
            status: "TERMINATED",
            terminatedAt: new Date()
        });

        logger.info(`Terminated VM session ${sessionId} for user ${userId}.`);
    }

    async getActiveSession(userId: string, roomId: string): Promise<VMSessionResponseDto | null> {
        const session = await this.cyberRoomRepository.findActiveSession(userId, roomId);
        if (!session) return null;

        return plainToInstance(VMSessionResponseDto, session, { excludeExtraneousValues: true });
    }
}
