import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { SearchController } from "./search.controller";

const router: Router = Router();
const searchController = container.get<SearchController>(TYPES.SearchController);


/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global search across all entities
 *     description: Search for users (u/), topics (t/), jobs (j/), problems (p/), companies (c/), and communities (d/).
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (e.g., "u/sahil" or "react")
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results fetched successfully
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Internal server error
 */
router.get("/", searchController.globalSearch);

export { router };
