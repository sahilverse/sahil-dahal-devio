import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CompanyController } from "./company.controller";

const router: Router = Router();
const companyController = container.get<CompanyController>(TYPES.CompanyController);

/**
 * @swagger
 * /companies/search:
 *   get:
 *     summary: Search companies
 *     tags: [Company]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Companies fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       logoUrl:
 *                         type: string
 *                         nullable: true
 */
router.get(
    "/search",
    companyController.searchCompanies
);

export { router };
