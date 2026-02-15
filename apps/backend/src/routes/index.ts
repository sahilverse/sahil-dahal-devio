import { Router } from "express";
import { router as authRoutes } from "../modules/auth";
import { router as userRoutes } from "../modules/user/user.route";
import { router as companyRoutes } from "../modules/company/company.route";
import { router as skillRoutes } from "../modules/skill/skill.route";
import { router as activityRoutes } from "../modules/activity/activity.route";

import { router as topicRoutes } from "../modules/topic/topic.route";
import { router as postRoutes } from "../modules/post/post.route";

import { router as communityRoutes } from "../modules/community/community.route";
import { router as compilerRoutes } from "../modules/compiler/compiler.route";
import problemRoutes from "../modules/problem/problem.route";
import submissionRoutes from "../modules/submission/submission.route";
import { auraRouter } from "../modules/aura/aura.route";
import { router as cipherRoutes } from "../modules/cipher/cipher.route";
import { router as commentRoutes } from "../modules/comment/comment.route";
import { router as notificationRoutes } from "../modules/notification/notification.route";
import { router as conversationRoutes } from "../modules/conversation/conversation.route";
import { router as eventRoutes } from "../modules/event/event.route";

const router: Router = Router();

router.use(authRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/skills", skillRoutes);
router.use("/activity", activityRoutes);
router.use("/topics", topicRoutes);
router.use("/posts", postRoutes);
router.use("/communities", communityRoutes);
router.use("/compiler", compilerRoutes);
router.use("/problems", problemRoutes);
router.use("/submissions", submissionRoutes);
router.use("/aura", auraRouter);
router.use("/cipher", cipherRoutes);
router.use("/notifications", notificationRoutes);
router.use(commentRoutes);
router.use("/conversations", conversationRoutes);
router.use("/events", eventRoutes);






export default router;