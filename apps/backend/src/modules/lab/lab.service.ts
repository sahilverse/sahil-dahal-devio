import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { LabRepository } from "./lab.repository";
import { LabRoomResponseDto, PaginatedLabsResponseDto, LabEnrollmentResponseDto, GetLabsParamsDto, CTFChallengeResponseDto, CTFSubmissionResponseDto, VMSessionResponseDto } from "./lab.dto";
import { plainToInstance } from "class-transformer";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { LabCTFService } from "./lab-ctf.service";
import { LabVMService } from "./lab-vm.service";

@injectable()
export class LabService {
    constructor(
        @inject(TYPES.LabRepository) private labRepository: LabRepository,
        @inject(TYPES.LabCTFService) private labCTFService: LabCTFService,
        @inject(TYPES.LabVMService) private labVMService: LabVMService
    ) { }

    async getRooms(params: GetLabsParamsDto): Promise<PaginatedLabsResponseDto> {
        const { rooms, total } = await this.labRepository.findAll(params);

        return plainToInstance(PaginatedLabsResponseDto, {
            rooms,
            total
        }, { excludeExtraneousValues: true });
    }

    async getRoomBySlug(slug: string): Promise<LabRoomResponseDto> {
        const room = await this.labRepository.findBySlug(slug);
        if (!room) {
            throw new ApiError("Room not found", StatusCodes.NOT_FOUND);
        }

        return plainToInstance(LabRoomResponseDto, room, { excludeExtraneousValues: true });
    }

    async joinRoom(roomId: string, userId: string): Promise<LabEnrollmentResponseDto> {
        // Check if room exists
        const room = await this.labRepository.findById(roomId);
        if (!room) {
            throw new ApiError("Room not found", StatusCodes.NOT_FOUND);
        }

        // Check if already enrolled
        let enrollment = await this.labRepository.findEnrollment(roomId, userId);
        if (!enrollment) {
            enrollment = await this.labRepository.createEnrollment(roomId, userId);
        }

        return plainToInstance(LabEnrollmentResponseDto, enrollment, { excludeExtraneousValues: true });
    }

    async getEnrollment(roomId: string, userId: string): Promise<LabEnrollmentResponseDto | null> {
        const enrollment = await this.labRepository.findEnrollment(roomId, userId);
        if (!enrollment) return null;

        return plainToInstance(LabEnrollmentResponseDto, enrollment, { excludeExtraneousValues: true });
    }

    async getRoomChallenges(roomId: string, userId: string): Promise<CTFChallengeResponseDto[]> {
        return this.labCTFService.getChallenges(roomId, userId);
    }

    async submitFlag(challengeId: string, userId: string, answer: string, timezoneOffset?: number): Promise<CTFSubmissionResponseDto> {
        return this.labCTFService.submitFlag(challengeId, userId, answer, timezoneOffset);
    }

    async startVMSession(userId: string, roomId: string): Promise<VMSessionResponseDto> {
        return this.labVMService.startSession(userId, roomId);
    }

    async extendVMSession(sessionId: string, userId: string): Promise<VMSessionResponseDto> {
        return this.labVMService.extendSession(sessionId, userId);
    }

    async terminateVMSession(sessionId: string, userId: string): Promise<void> {
        return this.labVMService.terminateSession(sessionId, userId);
    }

    async getActiveVMSession(userId: string, roomId: string): Promise<VMSessionResponseDto | null> {
        return this.labVMService.getActiveSession(userId, roomId);
    }
}
