import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CTFService } from "./ctf.service";
import { VMSessionService } from "./vm-session.service";
import { CyberRoomRepository } from "./cyber-room.repository";
import { CTFChallengeResponseDto, VMSessionResponseDto, CTFSubmissionResponseDto } from "./cyber-room.dto";
import { plainToInstance } from "class-transformer";

@injectable()
export class CyberRoomService {
    constructor(
        @inject(TYPES.CyberRoomRepository) private cyberRoomRepository: CyberRoomRepository,
        @inject(TYPES.CTFService) private ctfService: CTFService,
        @inject(TYPES.VMSessionService) private vmSessionService: VMSessionService
    ) { }

    async getRoomChallenges(roomId: string, userId: string): Promise<CTFChallengeResponseDto[]> {
        const challenges = await this.ctfService.getChallenges(roomId, userId);
        return plainToInstance(CTFChallengeResponseDto, challenges, { excludeExtraneousValues: true });
    }

    async submitFlag(challengeId: string, userId: string, answer: string, timezoneOffset?: number): Promise<CTFSubmissionResponseDto> {
        return this.ctfService.submitFlag(challengeId, userId, answer, timezoneOffset);
    }

    async startVMSession(userId: string, roomId: string): Promise<VMSessionResponseDto> {
        return this.vmSessionService.startSession(userId, roomId);
    }

    async extendVMSession(sessionId: string, userId: string): Promise<VMSessionResponseDto> {
        return this.vmSessionService.extendSession(sessionId, userId);
    }

    async terminateVMSession(sessionId: string, userId: string): Promise<void> {
        return this.vmSessionService.terminateSession(sessionId, userId);
    }

    async getActiveVMSession(userId: string, roomId: string): Promise<VMSessionResponseDto | null> {
        return this.vmSessionService.getActiveSession(userId, roomId);
    }
}
