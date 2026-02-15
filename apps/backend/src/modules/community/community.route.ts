
import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CommunityController } from "./community.controller";
import { AuthMiddleware, validateRequest, upload } from "../../middlewares";
import { createCommunitySchema } from "@devio/zod-utils";

const router: Router = Router();
const communityController = container.get<CommunityController>(TYPES.CommunityController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Community
 *   description: Community management and moderation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunityVisibility:
 *       type: string
 *       enum: [PUBLIC, PRIVATE, RESTRICTED]
 *     JoinRequestStatus:
 *       type: string
 *       enum: [PENDING, APPROVED, REJECTED]
 *     CommunityResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         iconUrl: { type: string, nullable: true }
 *         bannerUrl: { type: string, nullable: true }
 *         visibility: { $ref: '#/components/schemas/CommunityVisibility' }
 *         memberCount: { type: integer }
 *         isMember: { type: boolean }
 *         activeMembers: { type: integer }
 *         weeklyVisitors: { type: integer }
 *         weeklyContributors: { type: integer }
 *         createdAt: { type: string, format: date-time }
 *     CommunitySettings:
 *       type: object
 *       properties:
 *         allowPostImages: { type: boolean }
 *         allowPostLinks: { type: boolean }
 *         requirePostApproval: { type: boolean }
 *         minAuraToPost: { type: integer }
 *         minAuraToComment: { type: integer }
 *     CommunityRules:
 *       type: object
 *       properties:
 *         rules: { type: object, description: "JSON object containing community rules" }
 *     JoinRequest:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         communityId: { type: string }
 *         status: { $ref: '#/components/schemas/JoinRequestStatus' }
 *         message: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         user:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             username: { type: string }
 *             avatarUrl: { type: string, nullable: true }
 */

/**
 * @swagger
 * /communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Community]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, visibility, tags]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "dev-community"
 *                 minLength: 3
 *                 maxLength: 20
 *               description:
 *                 type: string
 *                 example: "A community for developers"
 *               visibility: { $ref: '#/components/schemas/CommunityVisibility' }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *                 minItems: 1
 *                 maxItems: 5
 *                 example: ["dev", "coding"]
 *     responses:
 *       201:
 *         description: Community created successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunityResponse' }
 *       400: { description: Invalid input }
 *       401: { description: Unauthorized }
 *       409: { description: Community name already exists }
 */
router.post(
    "/",
    authMiddleware.guard,
    validateRequest(createCommunitySchema),
    communityController.createCommunity
);

/**
 * @swagger
 * /communities:
 *   get:
 *     summary: Search and list communities
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query (optional)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Communities matching the query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 communities:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CommunityResponse' }
 *                 nextCursor: { type: string, nullable: true }
 */
router.get("/", communityController.searchCommunities);

/**
 * @swagger
 * /communities/explore:
 *   get:
 *     summary: Get public communities grouped by topics for discovery
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: Communities grouped by topics
 */
router.get("/explore", authMiddleware.extractUser, communityController.getExploreCommunities);

/**
 * @swagger
 * /communities/{name}:
 *   get:
 *     summary: Get community details by name (Main Info)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *         description: Unique community name
 *     responses:
 *       200:
 *         description: Community details retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunityResponse' }
 *       403: { description: Private community access denied }
 *       404: { description: Community not found }
 */
router.get(
    "/:name",
    authMiddleware.extractUser,
    communityController.getCommunityByName
);

/**
 * @swagger
 * /communities/{name}/settings:
 *   get:
 *     summary: Get community configuration settings (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Community settings retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunitySettings' }
 *       403: { description: Forbidden }
 *       404: { description: Community not found }
 */
router.get("/:name/settings", authMiddleware.guard, communityController.getSettings);

/**
 * @swagger
 * /communities/{name}/rules:
 *   get:
 *     summary: Get community rules
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Community rules retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunityRules' }
 *       404: { description: Community not found }
 */
router.get("/:name/rules", communityController.getRules);

/**
 * @swagger
 * /communities/{name}/members:
 *   get:
 *     summary: List and search community members
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by username
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CommunityMember' }
 *                 nextCursor: { type: string, nullable: true }
 *       403: { description: Forbidden }
 *       404: { description: Community not found }
 */
router.get("/:name/members", authMiddleware.guard, communityController.getMembers);

/**
 * @swagger
 * /communities/{name}/moderators:
 *   get:
 *     summary: List community moderators
 *     tags: [Community]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of moderators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 moderators:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CommunityMember' }
 *                 nextCursor: { type: string, nullable: true }
 *       401: { description: Unauthorized }
 *       404: { description: Community not found }
 */
router.get(
    "/:name/moderators",
    authMiddleware.guard,
    communityController.getModerators
);


/**
 * @swagger
 * /communities/{name}/join:
 *   post:
 *     summary: Join a community or send a join request
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string, description: "Message to moderators for private communities" }
 *     responses:
 *       200:
 *         description: Successfully joined or request sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, enum: [JOINED, REQUEST_SENT] }
 *       400: { description: Already a member or request exists }
 *       401: { description: Unauthorized }
 */
router.post("/:name/join", authMiddleware.guard, communityController.joinCommunity);

/**
 * @swagger
 * /communities/{name}/leave:
 *   delete:
 *     summary: Leave a community
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Successfully left the community }
 *       400: { description: Not a member }
 *       403: { description: Creators cannot leave their own community }
 *       404: { description: Community not found }
 */
router.delete("/:name/leave", authMiddleware.guard, communityController.leaveCommunity);

/**
 * @swagger
 * /communities/{name}/requests:
 *   get:
 *     summary: List pending join requests (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of pending requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/JoinRequest' }
 *       403: { description: Forbidden }
 */
router.get("/:name/requests", authMiddleware.guard, communityController.getJoinRequests);

/**
 * @swagger
 * /communities/requests/{requestId}:
 *   patch:
 *     summary: Approve or reject a join request (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { $ref: '#/components/schemas/JoinRequestStatus' }
 *     responses:
 *       200: { description: Request reviewed successfully }
 *       400: { description: Request already processed }
 *       403: { description: Forbidden }
 *       404: { description: Request not found }
 */
router.patch("/requests/:requestId", authMiddleware.guard, communityController.reviewJoinRequest);

/**
 * @swagger
 * /communities/{name}/settings:
 *   patch:
 *     summary: Update community configuration & basic settings (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               visibility: { $ref: '#/components/schemas/CommunityVisibility' }
 *               allowPostImages: { type: boolean }
 *               allowPostLinks: { type: boolean }
 *               requirePostApproval: { type: boolean }
 *               minAuraToPost: { type: integer }
 *               minAuraToComment: { type: integer }
 *     responses:
 *       200: { description: Settings updated }
 *       403: { description: Forbidden }
 */
router.patch("/:name/settings", authMiddleware.guard, communityController.updateSettings);

/**
 * @swagger
 * /communities/{name}/rules:
 *   patch:
 *     summary: Update community rules (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CommunityRules' }
 *     responses:
 *       200: { description: Rules updated }
 *       403: { description: Forbidden }
 */
router.patch("/:name/rules", authMiddleware.guard, communityController.updateRules);

/**
 * @swagger
 * /communities/{name}/media:
 *   patch:
 *     summary: Update community media (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               icon: { type: string, format: binary }
 *               banner: { type: string, format: binary }
 *     responses:
 *       200: { description: Media updated }
 *       403: { description: Forbidden }
 */
router.patch(
    "/:name/media",
    authMiddleware.guard,
    upload.fields([
        { name: "icon", maxCount: 1 },
        { name: "banner", maxCount: 1 }
    ]),
    communityController.updateMedia
);

/**
 * @swagger
 * /communities/{name}/media/{type}:
 *   delete:
 *     summary: Remove community media (Moderators only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [icon, banner]
 *     responses:
 *       200: { description: Media removed successfully }
 *       403: { description: Forbidden }
 *       404: { description: Community not found }
 */
router.delete("/:name/media/:type", authMiddleware.guard, communityController.removeMedia);

/**
 * @swagger
 * /communities/{name}/moderators/{userId}:
 *   patch:
 *     summary: Update moderator permissions (Admin only)
 *     tags: [Community]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isMod: { type: boolean }
 *               permissions: { type: object }
 *     responses:
 *       200: { description: Permissions updated }
 *       403: { description: Only creators can manage moderators }
 */
router.patch("/:name/moderators/:userId", authMiddleware.guard, communityController.updateModeratorPermissions);

export { router };
