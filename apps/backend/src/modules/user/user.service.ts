import { injectable, inject } from "inversify";
import { UserRepository } from "./user.repository";
import { ApiError } from "../../utils/ApiError";
import type { User } from "../../generated/prisma/client";
import type { OnboardingPayload } from "./user.types";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";

@injectable()
export class UserService {
    constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) { }

    async completeOnboarding(userId: string, payload: OnboardingPayload): Promise<User> {
        const existingUser = await this.userRepository.findByUsername(payload.username);
        if (existingUser && existingUser.id !== userId) {
            throw new ApiError("Username already taken", StatusCodes.CONFLICT);
        }

        const updatedUser = await this.userRepository.updateUserProfile(userId, {
            username: payload.username,
            firstName: payload.firstName,
            lastName: payload.lastName,
        });

        return updatedUser;
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userRepository.findById(userId);
    }
}
