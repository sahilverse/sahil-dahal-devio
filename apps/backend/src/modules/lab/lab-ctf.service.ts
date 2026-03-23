import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { LabRepository } from "./lab.repository";
import { CTFSubmissionResponseDto, CTFChallengeResponseDto } from "./lab.dto";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";

import { ActivityType, CipherReason } from "../../generated/prisma/client";
import { ActivityService } from "../activity/activity.service";
import { CipherService } from "../cipher";

@injectable()
export class LabCTFService {
    constructor(
        @inject(TYPES.LabRepository) private labRepository: LabRepository,
        @inject(TYPES.ActivityService) private activityService: ActivityService,
        @inject(TYPES.CipherService) private cipherService: CipherService,
    ) { }

    async submitFlag(challengeId: string, userId: string, answer: string, timezoneOffset?: number): Promise<CTFSubmissionResponseDto> {
        const challenge = await this.labRepository.findChallengeById(challengeId);
        if (!challenge) {
            throw new ApiError("Challenge not found", StatusCodes.NOT_FOUND);
        }

        // Check if already solved
        const existingSubmission = await this.labRepository.findSubmission(challengeId, userId);
        if (existingSubmission) {
            return plainToInstance(CTFSubmissionResponseDto, {
                isCorrect: true,
                message: "You have already solved this challenge!"
            });
        }

        // Validate flag
        const isCorrect = challenge.flag.trim() === answer.trim();

        // Create submission record
        await this.labRepository.createSubmission({
            challenge: { connect: { id: challengeId } },
            user: { connect: { id: userId } },
            answer,
            isCorrect
        });

        if (isCorrect) {
            // Update enrollment progress
            const enrollment = await this.labRepository.findEnrollment(challenge.roomId, userId);
            if (!enrollment) throw new ApiError("Enrollment not found", StatusCodes.NOT_FOUND);

            const solvedCount = await this.labRepository.countSolvedChallenges(userId, challenge.roomId);
            const totalChallenges = await this.labRepository.countChallengesInRoom(challenge.roomId);
            
            const progress = totalChallenges > 0 ? Math.floor((solvedCount / totalChallenges) * 100) : 0;
            const isCompleted = progress === 100;

            await this.labRepository.updateEnrollment(enrollment.id, {
                progress,
                isCompleted,
                completedAt: isCompleted ? new Date() : undefined
            });

            // Log activity
            await this.activityService.logActivity(userId, ActivityType.CTF_CHALLENGE_SOLVED, timezoneOffset);

            // Award Bounty if completed for the first time
            if (isCompleted && (enrollment as any).awardBounty) {
                const room = await this.labRepository.findById(challenge.roomId);
                if (room && room.cipherReward > 0) {
                    await this.cipherService.awardCipher(
                        userId,
                        room.cipherReward,
                        CipherReason.PROBLEM_SOLVED_BOUNTY,
                        room.id
                    );
                }
                // Mark bounty as awarded
                await this.labRepository.updateEnrollment(enrollment.id, {
                    awardBounty: false
                });
            }

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
        const challenges = await this.labRepository.findChallengesByRoomId(roomId);

        // Map challenges and check if solved by user
        const results = await Promise.all(challenges.map(async (c) => {
            const solved = await this.labRepository.findSubmission(c.id, userId);
            return {
                ...c,
                isSolved: !!solved
            };
        }));

        return plainToInstance(CTFChallengeResponseDto, results, { excludeExtraneousValues: true });
    }
}
