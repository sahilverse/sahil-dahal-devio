import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CyberRoomController } from "./cyber-room.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const cyberRoomController = container.get<CyberRoomController>(TYPES.CyberRoomController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: CyberRoom
 *   description: Internal room logic for CTFs and VM sessions
 */

router.get("/:roomId/challenges", authMiddleware.guard, cyberRoomController.getChallenges);
router.post("/challenges/:challengeId/submit", authMiddleware.guard, cyberRoomController.submitFlag);

router.post("/session", authMiddleware.guard, cyberRoomController.startSession);
router.get("/session/active/:roomId", authMiddleware.guard, cyberRoomController.getActiveSession);
router.post("/session/:sessionId/extend", authMiddleware.guard, cyberRoomController.extendSession);
router.post("/session/:sessionId/terminate", authMiddleware.guard, cyberRoomController.terminateSession);

export { router };
