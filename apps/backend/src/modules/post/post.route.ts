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

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Fetch posts 
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (ID of the last item)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to fetch
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by User ID
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *         description: Filter by Community ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PUBLISHED, DRAFT]
 *         description: Filter by Status
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         description: Filter by Visibility
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 */
router.get(
    "/",
    authMiddleware.extractUser,
    postController.getPosts
);

/**
 * @swagger
 * /posts/count:
 *   get:
 *     summary: Get post count (e.g. for drafts)
 *     tags: [Post]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PUBLISHED, DRAFT]
 *         description: Filter by status
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         description: Filter by Visibility
 *     responses:
 *       200:
 *         description: Post count fetched successfully
 *       403:
 *         description: Unauthorized
 */
router.get("/count", authMiddleware.guard, postController.getPostCount);

/**
 * @swagger
 * /posts/{postId}:
 *   patch:
 *     summary: Update a post
 *     tags: [Post]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, DRAFT]
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE]
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       403:
 *         description: Unauthorized
 * 
 *   delete:
 *     summary: Delete a post
 *     tags: [Post]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       403:
 *         description: Unauthorized
 */
router.patch("/:postId", authMiddleware.guard, postController.updatePost);
router.delete("/:postId", authMiddleware.guard, postController.deletePost);

export { router };
