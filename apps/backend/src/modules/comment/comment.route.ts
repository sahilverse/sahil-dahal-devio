import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { CommentController } from "./comment.controller";
import { AuthMiddleware } from "../../middlewares";
import { upload } from "../../middlewares/upload.middleware";

const router: Router = Router();
const commentController = container.get<CommentController>(TYPES.CommentController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Create a comment on a post
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 description: Optional parent comment ID for replies
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Max 3 images
 *     responses:
 *       201:
 *         description: Comment created
 *       404:
 *         description: Post not found
 *
 *   get:
 *     summary: Get comments for a post (paginated)
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [best, newest, oldest]
 *           default: best
 *     responses:
 *       200:
 *         description: Comments fetched
 */
router.post(
    "/posts/:postId/comments",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    upload.array("media", 3),
    commentController.createComment
);

router.get(
    "/posts/:postId/comments",
    authMiddleware.extractUser,
    commentController.getComments
);

/**
 * @swagger
 * /posts/{postId}/accept-answer:
 *   post:
 *     summary: Accept a comment as the best answer (QUESTION posts only)
 *     tags: [Comment]
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
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer accepted
 *       403:
 *         description: Only post author can accept
 */
router.post(
    "/posts/:postId/accept-answer",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    commentController.acceptAnswer
);

/**
 * @swagger
 * /comments/{commentId}/replies:
 *   get:
 *     summary: Get replies for a comment (paginated)
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Replies fetched
 *
 * /comments/{commentId}:
 *   patch:
 *     summary: Edit a comment
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       403:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a comment (soft delete)
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Unauthorized
 *
 * /comments/{commentId}/vote:
 *   post:
 *     summary: Vote on a comment
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               type:
 *                 type: string
 *                 enum: [UP, DOWN, null]
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Vote recorded
 */
router.get(
    "/comments/:commentId/replies",
    authMiddleware.extractUser,
    commentController.getReplies
);

router.patch(
    "/comments/:commentId",
    authMiddleware.guard,
    commentController.updateComment
);

router.delete(
    "/comments/:commentId",
    authMiddleware.guard,
    commentController.deleteComment
);

router.post(
    "/comments/:commentId/vote",
    authMiddleware.guard,
    commentController.voteComment
);

export { router };
