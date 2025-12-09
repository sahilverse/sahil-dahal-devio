import { Router } from "express";
import { router as authRoutes } from "../modules/auth";

const router: Router = Router();

router.use(authRoutes);



export default router;