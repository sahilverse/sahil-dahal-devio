import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JwtManager, logger, ResponseHandler } from '../utils';
import { RESET_PASSWORD_SESSION_TOKEN_PREFIX } from '../config/constants';
import { TYPES } from '../types';
import { UserRepository } from '../modules/user';
import { RedisManager } from '../config';
import { ReqUser } from '../modules/auth';
import { JwtPayload } from 'jsonwebtoken';
import { AccountStatus } from '../generated/prisma/enums';


@injectable()
export class AuthMiddleware {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
    ) { }

    guard = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = this.extractTokenFromHeader(authHeader);
            if (!token) {
                return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
            }

            let decoded: JwtPayload;
            try {
                decoded = JwtManager.verifyAccessToken(token) as JwtPayload;
            } catch {
                return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
            }

            const userId = decoded.sub as string;

            const user = await this.userRepository.findById(userId);
            if (!user) {
                return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, 'User not found');
            }

            if (user.accountStatus !== AccountStatus.ACTIVE) {
                return ResponseHandler.sendError(res, StatusCodes.FORBIDDEN, 'Inactive account');
            }

            req.user = {
                id: user.id,
                email: user.email,
                roleId: user.roleId,
                username: user.username,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
            } as ReqUser;

            next();

        } catch (error: any) {
            logger.error('Auth Middleware Error:', error);
            next(error);
        }
    }

    extractUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = this.extractTokenFromHeader(authHeader);
            if (!token) {
                return next();
            }

            let decoded: JwtPayload;
            try {
                decoded = JwtManager.verifyAccessToken(token) as JwtPayload;
            } catch {
                return next();
            }

            const userId = decoded.sub as string;
            const user = await this.userRepository.findById(userId);

            if (user && user.accountStatus === AccountStatus.ACTIVE) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    roleId: user.roleId,
                    username: user.username,
                    accountStatus: user.accountStatus,
                    emailVerified: user.emailVerified,
                } as ReqUser;
            }
            next();
        } catch (error: any) {
            next();
        }
    }

    guardResetPasswordSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = this.extractTokenFromHeader(authHeader);
            if (!token) {
                return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
            }

            let decoded: { email: string; jti: string; };
            try {
                decoded = JwtManager.verifyResetPasswordSessionToken(token);
            } catch (error: any) {
                logger.error(`Invalid or expired reset session token: ${error}`);
                return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
            }

            const session = await this.redisClient.get(`${RESET_PASSWORD_SESSION_TOKEN_PREFIX}${decoded.jti}`);
            if (!session) {
                return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
            }

            req.user = { email: decoded.email } as ReqUser;

            next();
        } catch (error: any) {
            logger.error('Auth Middleware Error:', error);
            next(error);
        }
    };

    checkRole = (allowedRoleIds: number[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const user = req.user as ReqUser;
            if (!user || user.roleId === null || !allowedRoleIds.includes(user.roleId)) {
                return ResponseHandler.sendError(res, StatusCodes.FORBIDDEN, 'Insufficient permissions');
            }
            next();
        };
    }

    private extractTokenFromHeader(authHeader?: Request['headers']['authorization']): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.split(' ')[1] ?? null;
    }


    private get redisClient() {
        return this.redisManager.getPub();
    }

}