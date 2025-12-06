import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { AuthController } from "./auth.controller";
import { validateRequest } from '../../middlewares';
import { registerSchema, loginSchema } from "@devio/zod-utils";

const router: Router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);

export { router };
