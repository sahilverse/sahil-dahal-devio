import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { LabRepository } from "./lab.repository";
import { CipherService } from "../cipher/cipher.service";
import { VMSessionResponseDto } from "./lab.dto";
import { ApiError, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import { addMinutes } from "date-fns";
import { CipherReason } from "../../generated/prisma/client";
import axios from "axios";
import { LAB_ORCHESTRATOR_URL } from "../../config/constants";

const BASE_DAILY_MINUTES = 60;
const EXTENSION_MINUTES = 30;
const EXTENSION_COST = 50;

@injectable()
export class LabVMService {
    constructor(
        @inject(TYPES.LabRepository) private labRepository: LabRepository,
        @inject(TYPES.CipherService) private cipherService: CipherService
    ) { }

    private async calculateRemainingDailyTime(userId: string): Promise<number> {
        const sessions = await this.labRepository.findSessionsByUserIdToday(userId);
        const extensionCount = await this.cipherService.countExtensionsToday(userId);
        
        let usedSeconds = 0;
        const now = new Date();
        
        for (const session of sessions) {
            const start = new Date(session.startedAt);
            const end = session.terminatedAt ? new Date(session.terminatedAt) : now;
            usedSeconds += Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
        }
        
        const totalBudgetSeconds = (BASE_DAILY_MINUTES * 60) + (extensionCount * EXTENSION_MINUTES * 60);
        return Math.max(0, totalBudgetSeconds - usedSeconds);
    }

    async startSession(userId: string, roomId: string): Promise<VMSessionResponseDto> {
        // Check for active session
        const activeSession = await this.labRepository.findActiveSession(userId, roomId);
        if (activeSession) {
            return plainToInstance(VMSessionResponseDto, activeSession, { excludeExtraneousValues: true });
        }

        // Calculate remaining daily time
        const remainingSeconds = await this.calculateRemainingDailyTime(userId);
        if (remainingSeconds <= 0) {
            throw new ApiError("Daily free VM limit reached (60 mins). You can extend your session for 50 Ciphers.", StatusCodes.PAYMENT_REQUIRED);
        }

        // Get room to get imageId
        const room = await this.labRepository.findById(roomId);
        if (!room) {
            throw new ApiError("Room not found", StatusCodes.NOT_FOUND);
        }

        // Provision machine via Lab Orchestrator
        let instanceId = null;
        let ipAddress = null;

        try {
            const response = await axios.post(`${LAB_ORCHESTRATOR_URL}/api/instances/provision`, {
                roomId,
                userId,
                imageId: room.imageId || "alpine:latest"
            });

            const instance = response.data.result;
            instanceId = instance.instanceId;
            ipAddress = instance.ipAddress;
        } catch (error: any) {
            logger.error(error, `Failed to provision lab machine:`);
            throw new ApiError("Failed to start lab environment. Please check if Lab Orchestrator is running.", StatusCodes.SERVICE_UNAVAILABLE);
        }

        const expiresAt = new Date(Date.now() + (remainingSeconds * 1000));

        const session = await this.labRepository.createSession({
            user: { connect: { id: userId } },
            room: { connect: { id: roomId } },
            status: "RUNNING",
            expiresAt,
            startedAt: new Date(),
            instanceId: instanceId,
            ipAddress: ipAddress
        });

        logger.info(`Started VM session ${session.id} for user ${userId} in room ${roomId}. Expires at ${expiresAt} (Daily Budget)`);

        return plainToInstance(VMSessionResponseDto, session, { excludeExtraneousValues: true });
    }

    async extendSession(sessionId: string, userId: string): Promise<VMSessionResponseDto> {
        const session = await this.labRepository.findSessionById(sessionId);
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

        // Extend expiresAt by 30 mins
        const newExpiresAt = addMinutes(new Date(session.expiresAt), EXTENSION_MINUTES);
        const updatedSession = await this.labRepository.updateSession(sessionId, {
            expiresAt: newExpiresAt
        });

        logger.info(`Extended VM session ${sessionId} for user ${userId}. New expiry: ${newExpiresAt}`);

        return plainToInstance(VMSessionResponseDto, updatedSession, { excludeExtraneousValues: true });
    }

    async terminateSession(sessionId: string, userId: string): Promise<void> {
        const session = await this.labRepository.findSessionById(sessionId);
        if (!session || session.userId !== userId) {
            throw new ApiError("Session not found", StatusCodes.NOT_FOUND);
        }

        if (session.instanceId) {
            try {
                const orchestratorUrl = process.env.LAB_ORCHESTRATOR_URL || "http://localhost:5500";
                const orchestratorSecret = process.env.LAB_ORCHESTRATOR_SECRET || "devio-secret-key";

                await axios.post(`${orchestratorUrl}/api/instances/${session.instanceId}/terminate`, {});
            } catch (error: any) {
                logger.error(`Failed to terminate lab machine ${session.instanceId}:`, error?.response?.data || error.message);
            }
        }

        await this.labRepository.updateSession(sessionId, {
            status: "TERMINATED",
            terminatedAt: new Date()
        });

        logger.info(`Terminated VM session ${sessionId} for user ${userId}.`);
    }

    async getActiveSession(userId: string, roomId: string): Promise<VMSessionResponseDto | null> {
        const session = await this.labRepository.findActiveSession(userId, roomId);
        if (!session) return null;

        return plainToInstance(VMSessionResponseDto, session, { excludeExtraneousValues: true });
    }
}
