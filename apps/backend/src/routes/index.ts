import { Router } from "express";
import { router as authRoutes } from "../modules/auth";
import { router as userRoutes } from "../modules/user/user.route";
import { router as companyRoutes } from "../modules/company/company.route";
import { router as activityRoutes } from "../modules/activity/activity.route";

const router: Router = Router();

router.use(authRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/activity", activityRoutes);



export default router;