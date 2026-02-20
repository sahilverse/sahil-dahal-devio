import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { JobController } from "./job.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const jobController = container.get<JobController>(TYPES.JobController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Job
 *   description: Job board and placement management
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with filtering
 *     tags: [Job]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
 */
router.get(
    "/",
    jobController.getJobs
);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Post a new job (Verified companies only)
 *     tags: [Job]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, title, description]
 *             properties:
 *               companyId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, REMOTE]
 *               workplace:
 *                 type: string
 *                 enum: [ON_SITE, HYBRID, REMOTE]
 *               location:
 *                 type: string
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               applyLink:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job posted successfully
 *       403:
 *         description: Only verified companies can post jobs
 */
router.post(
    "/",
    authMiddleware.guard,
    jobController.createJob
);

/**
 * @swagger
 * /jobs/{slug}:
 *   get:
 *     summary: Get job details by slug
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job fetched successfully
 */
router.get(
    "/:slug",
    jobController.getJobBySlug
);

/**
 * @swagger
 * /jobs/{id}:
 *   patch:
 *     summary: Update job details
 *     tags: [Job]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Job updated successfully
 */
router.patch(
    "/:id",
    authMiddleware.guard,
    jobController.updateJob
);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job posting
 *     tags: [Job]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 */
router.delete(
    "/:id",
    authMiddleware.guard,
    jobController.deleteJob
);

export { router };
