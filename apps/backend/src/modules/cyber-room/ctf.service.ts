import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CyberRoomRepository } from "./cyber-room.repository";
import { CTFSubmissionResponseDto } from "./cyber-room.dto";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";

@injectable()
export class CTFService {
    constructor(
        @inject(TYPES.CyberRoomRepository) private cyberRoomRepository: CyberRoomRepository,
        // @inject(TYPES.AuraService) private auraService: any, // To be integrated
    ) { }

    async submitFlag(challengeId: string, userId: string, answer: string): Promise<CTFSubmissionResponseDto> {
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
            // TODO: Update user progress and award points/aura
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

    async getChallenges(roomId: string, userId: string): Promise<any[]> {
        const challenges = await this.cyberRoomRepository.findChallengesByRoomId(roomId);

        // Map challenges and check if solved by user
        const results = await Promise.all(challenges.map(async (c) => {
            const solved = await this.cyberRoomRepository.findSubmission(c.id, userId);
            return {
                ...c,
                isSolved: !!solved,
                flag: undefined // Don't send the flag to frontend!
            };
        }));

        return results;
    }
}
