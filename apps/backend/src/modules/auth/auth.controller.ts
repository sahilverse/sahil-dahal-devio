import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../utils";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils";



@injectable()
export class AuthController {
    constructor(@inject(TYPES.AuthService) private authService: AuthService) { }


    register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const registerPayload = req.body;
        const user = await this.authService.registerUser(registerPayload);
        ResponseHandler.sendResponse(res, 201, "User registered successfully");
    });

    login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const loginPayload = req.body;
        const loginResponse = await this.authService.loginUser(loginPayload);
        ResponseHandler.sendResponse(res, 200, "Login successful", loginResponse);
    });

}