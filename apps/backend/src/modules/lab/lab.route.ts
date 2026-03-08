import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { LabController } from "./lab.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const labController = container.get<LabController>(TYPES.LabController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Lab
 *   description: Laboratory and learning rooms management
 */

router.get("/", labController.getRooms);
router.get("/:slug", labController.getRoomBySlug);
router.post("/join", authMiddleware.guard, labController.joinRoom);
router.get("/enrollment/:roomId", authMiddleware.guard, labController.getEnrollment);

export { router };
