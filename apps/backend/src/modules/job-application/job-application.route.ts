import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { JobApplicationController } from "./job-application.controller";
import { AuthMiddleware } from "../../middlewares";

const router: Router = Router();
const controller = container.get<JobApplicationController>(TYPES.JobApplicationController);
const auth = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Job Application
 *   description: Management of job applications
 */

/**
 * @swagger
 * /jobs/applications/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Job Application]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId, coverLetter]
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Applied successfully
 *       403:
 *         description: Recruiters/Owners cannot apply to their own company jobs
 */
router.post(
    "/apply",
    auth.guard,
    controller.applyForJob
);

/**
 * @swagger
 * /jobs/applications/me:
 *   get:
 *     summary: Get current user's job applications
 *     tags: [Job Application]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Applications fetched successfully
 */
router.get(
    "/me",
    auth.guard,
    controller.getUserApplications
);

/**
 * @swagger
 * /jobs/applications/check/{jobId}:
 *   get:
 *     summary: Check if current user has applied for a specific job
 *     tags: [Job Application]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns hasApplied boolean
 */
router.get(
    "/:jobId",
    auth.guard,
    controller.getJobApplications
);

/**
 * @swagger
 * /jobs/applications/{id}/status:
 *   patch:
 *     summary: Update an application's status (Recruiters/Owners only)
 *     tags: [Job Application]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWING, SHORTLISTED, ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       403:
 *         description: Insufficient permissions
 */
router.patch(
    "/:id/status",
    auth.guard,
    controller.updateApplicationStatus
);

export { router };
