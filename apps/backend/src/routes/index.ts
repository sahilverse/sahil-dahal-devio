import { Router } from "express";
import { router as authRoutes } from "../modules/auth";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
router.use("/auth", authRoutes);



export default router;