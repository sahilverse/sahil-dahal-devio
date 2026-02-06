import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { UserService } from "./user.service";
import { asyncHandler, ResponseHandler, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { toAuthUserDTO } from "../auth";

@injectable()
export class UserController {
    constructor(@inject(TYPES.UserService) private userService: UserService) { }

    completeOnboarding = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { username, firstName, lastName } = req.body;

        const updatedUser = await this.userService.completeOnboarding(userId, {
            username,
            firstName,
            lastName,
        });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Profile completed successfully", toAuthUserDTO(updatedUser));
    });

    getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params as { username: string };
        const viewerId = req.user?.id;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        const profile = await this.userService.getProfile(username, viewerId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Profile fetched successfully", profile);
    });

    followUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params as { username: string };
        const followerId = req.user!.id;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        await this.userService.followUser(username, followerId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Followed successfully");
    });

    unfollowUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params as { username: string };
        const followerId = req.user!.id;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        await this.userService.unfollowUser(username, followerId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Unfollowed successfully");
    });

    uploadAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const file = req.file;

        if (!file) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "No file uploaded");
        }

        const avatarUrl = await this.userService.updateAvatar(userId, file);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Avatar updated successfully", { avatarUrl });
    });

    uploadBanner = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const file = req.file;

        if (!file) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "No file uploaded");
        }

        const bannerUrl = await this.userService.updateBanner(userId, file);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Banner updated successfully", { bannerUrl });
    });

    removeAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        await this.userService.removeAvatar(userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Avatar removed successfully");
    });

    removeBanner = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        await this.userService.removeBanner(userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Banner removed successfully");
    });

    updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const payload = req.body;

        await this.userService.updateProfile(userId, payload);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Profile updated successfully");
    });

    updateNames = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const payload = req.body;

        await this.userService.updateNames(userId, payload);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Names updated successfully");
    });

    addExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const payload = req.body;

        const experience = await this.userService.addExperience(userId, payload);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Experience added successfully", experience);
    });

    updateExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const payload = req.body;

        const experience = await this.userService.updateExperience(userId, id, payload);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Experience updated successfully", experience);
    });

    removeExperience = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await this.userService.deleteExperience(userId, id);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Experience removed successfully");
    });

    addEducation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const payload = req.body;

        const education = await this.userService.addEducation(userId, payload);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Education added successfully", education);
    });

    updateEducation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const payload = req.body;

        const education = await this.userService.updateEducation(userId, id, payload);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Education updated successfully", education);
    });

    removeEducation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await this.userService.deleteEducation(userId, id);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Education removed successfully");
    });

    addSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { name } = req.body;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Skill name is required");
        }

        const userSkill = await this.userService.addSkill(userId, name);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Skill added successfully", userSkill);
    });

    removeSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await this.userService.removeSkill(userId, id);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Skill removed successfully");
    });

    addCertification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const payload = req.body;

        const certification = await this.userService.addCertification(userId, payload);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Certification added successfully", certification);
    });

    updateCertification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const payload = req.body;

        const certification = await this.userService.updateCertification(userId, id, payload);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Certification updated successfully", certification);
    });

    removeCertification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await this.userService.removeCertification(userId, id);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Certification removed successfully");
    });
}
