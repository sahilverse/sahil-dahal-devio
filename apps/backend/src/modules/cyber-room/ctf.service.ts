import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CyberRoomRepository } from "./cyber-room.repository";
import { CTFSubmissionResponseDto, CTFChallengeResponseDto } from "./cyber-room.dto";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";

import { ActivityType } from "../../generated/prisma/client";
import { ActivityService } from "../activity/activity.service";

@injectable()
export class CTFService {
    constructor(
        @inject(TYPES.CyberRoomRepository) private cyberRoomRepository: CyberRoomRepository,
        @inject(TYPES.ActivityService) private activityService: ActivityService,
        // @inject(TYPES.AuraService) private auraService: AuraService, // To be integrated
    ) { }

    async submitFlag(challengeId: string, userId: string, answer: string, timezoneOffset?: number): Promise<CTFSubmissionResponseDto> {
        const challenge = await this.cyberRoomRepository.findChallengeById(challengeId);
        if (!challenge) {
            throw new ApiError("Challenge not found", StatusCodes.NOT_FOUND);
        }

        // Check if already solved
        const existingSubmission = await this.cyberRoomRepository.findSubmission(challengeId, userId);
        if (existingSubmission) {
            return plainToInstance(CTFSubmissionResponseDto, {
                isCorrect: true,
                message: "You have already solved this challenge!"
            });
        }

        // Validate flag
        const isCorrect = challenge.flag.trim() === answer.trim();

        // Create submission record
        await this.cyberRoomRepository.createSubmission({
            challenge: { connect: { id: challengeId } },
            user: { connect: { id: userId } },
            answer,
            isCorrect
        });

        if (isCorrect) {
            // Update user progress
            const solvedCount = await this.cyberRoomRepository.countSolvedChallenges(userId, challenge.roomId);
            const totalChallenges = await this.cyberRoomRepository.countChallengesInRoom(challenge.roomId);
            
            const progress = totalChallenges > 0 ? Math.floor((solvedCount / totalChallenges) * 100) : 0;
            const isCompleted = progress === 100;

            await this.cyberRoomRepository.updateEnrollment(userId, challenge.roomId, {
                progress,
                isCompleted,
                completedAt: isCompleted ? new Date() : undefined
            });

            // Log activity
            await this.activityService.logActivity(userId, ActivityType.CTF_CHALLENGE_SOLVED, timezoneOffset);

            return plainToInstance(CTFSubmissionResponseDto, {
                isCorrect: true,
                message: "Correct! Flag captured.",
                pointsAwarded: challenge.points
            });
        }

        return plainToInstance(CTFSubmissionResponseDto, {
            isCorrect: false,
            message: "Incorrect flag. Try again!"
        });
    }

    async getChallenges(roomId: string, userId: string): Promise<CTFChallengeResponseDto[]> {
        const challenges = await this.cyberRoomRepository.findChallengesByRoomId(roomId);

        // Map challenges and check if solved by user
        const results = await Promise.all(challenges.map(async (c) => {
            const solved = await this.cyberRoomRepository.findSubmission(c.id, userId);
            return {
                ...c,
                isSolved: !!solved
            };
        }));

        return plainToInstance(CTFChallengeResponseDto, results, { excludeExtraneousValues: true });
    }
}
