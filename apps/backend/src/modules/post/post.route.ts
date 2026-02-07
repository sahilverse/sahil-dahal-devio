import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { PostController } from "./post.controller";
import { AuthMiddleware, validateRequest } from "../../middlewares";
import { upload } from "../../middlewares/upload.middleware";
import { sanitizePostRequest } from "./post.middleware";
import { createPostSchema } from "@devio/zod-utils";

const router: Router = Router();
const postController = container.get<PostController>(TYPES.PostController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               communityId:
 *                 type: string
 *                 description: Optional CUID of the community to link this post to.
 *               type:
 *                 type: string
 *                 enum: [TEXT, LINK, QUESTION, POLL]
 *               linkUrl:
 *                 type: string
 *                 description: Required for LINK posts. Not allowed for others.
 *               bountyAmount:
 *                 type: integer
 *                 description: Optional for QUESTION posts. Not allowed for others.
 *               pollOptions:
 *                 type: string
 *                 description: JSON string of array of options. Required for POLL posts.
 *                 example: '["Option 1", "Option 2"]'
 *               topics:
 *                 type: string
 *                 description: JSON string of array of topic names.
 *                 example: '["React", "Node"]'
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Max 5 files. Allowed for TEXT and QUESTION. Forbidden for LINK and POLL.
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    authMiddleware.guard,
    upload.array("media", 5),
    sanitizePostRequest,
    validateRequest(createPostSchema),
    postController.createPost
);

export { router };
