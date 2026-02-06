import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { SkillController } from "./skill.controller";
import { AuthMiddleware, validateRequest, validateQuery } from "../../middlewares";
import { createSkillSchema, searchSkillSchema } from "@devio/zod-utils";

const router: Router = Router();
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const skillController = container.get<SkillController>(TYPES.SkillController);


/**
 * @swagger
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *
 * /skills/search:
 *   get:
 *     summary: Search skills by name
 *     tags: [Skills]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for skill name
 *     responses:
 *       200:
 *         description: Skills fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 */
router.get(
    "/search",
    authMiddleware.guard,
    validateQuery(searchSkillSchema),
    skillController.searchSkills
);


/**
 * @swagger
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *
 * /skills:
 *   post:
 *     summary: Create a new skill
 *     tags: [Skills]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Skill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 */
router.post(
    "/",
    authMiddleware.guard,
    validateRequest(createSkillSchema),
    skillController.createSkill
);

export { router };
