import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { ActivityController } from "./activity.controller";

const router: Router = Router();
const activityController = container.get<ActivityController>(TYPES.ActivityController);

/**
 * @swagger
 * /activity/{username}:
 *   get:
 *     summary: Get user activity data for a specific year
 *     description: Returns activity heatmap data for the specified year
 *     tags: [Activity]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username to fetch activity for
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *           default: 2026
 *         description: The year to fetch activity data for (defaults to current year)
 *     responses:
 *       200:
 *         description: Activity data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Activity data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2026
 *                     activityMap:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2026-01-15"
 *                           count:
 *                             type: integer
 *                             example: 5
 *                     totalActivities:
 *                       type: integer
 *                       example: 142
 *       400:
 *         description: Invalid year parameter
 *       404:
 *         description: User not found
 */
router.get("/:username", activityController.getActivityByYear);

/**
 * @swagger
 * /activity/{username}/years:
 *   get:
 *     summary: Get available years for user activity
 *     description: Returns list of years for which activity data is available
 *     tags: [Activity]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username to fetch available years for
 *     responses:
 *       200:
 *         description: Available years fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Available years fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     years:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [2026, 2025, 2024]
 *       404:
 *         description: User not found
 */
router.get("/:username/years", activityController.getAvailableYears);

export { router };
