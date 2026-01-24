import { Router } from "express";
import { router as authRoutes } from "../modules/auth";
import { router as userRoutes } from "../modules/user/user.route";

const router: Router = Router();

router.use(authRoutes);
router.use("/user", userRoutes);



export default router;