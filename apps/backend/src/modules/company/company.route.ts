import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CompanyController } from "./company.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const companyController = container.get<CompanyController>(TYPES.CompanyController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company management and member audit
 */

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
 */
router.get(
    "/search",
    companyController.searchCompanies
);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               location:
 *                 type: string
 *               size:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created successfully
 */
router.post(
    "/",
    authMiddleware.guard,
    companyController.createCompany
);

/**
 * @swagger
 * /companies/{slug}:
 *   get:
 *     summary: Get company by slug
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company fetched successfully
 */
router.get(
    "/:slug",
    companyController.getCompanyBySlug
);

/**
 * @swagger
 * /companies/{id}:
 *   patch:
 *     summary: Update company details
 *     tags: [Company]
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
 *         description: Company updated successfully
 */
router.patch(
    "/:id",
    authMiddleware.guard,
    companyController.updateCompany
);

/**
 * @swagger
 * /companies/{id}/members:
 *   post:
 *     summary: Manage company members (Add, Remove, Update Role)
 *     tags: [Company]
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
 *             required: [userId, action]
 *             properties:
 *               userId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [ADD, REMOVE, UPDATE_ROLE]
 *               role:
 *                 type: string
 *                 enum: [OWNER, RECRUITER, MEMBER]
 *     responses:
 *       200:
 *         description: Member managed successfully
 */
router.post(
    "/:id/members",
    authMiddleware.guard,
    companyController.manageMember
);

/**
 * @swagger
 * /companies/{id}/verify-domain:
 *   post:
 *     summary: Verify company domain via email
 *     tags: [Company]
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
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Domain verified successfully
 */
router.post(
    "/:id/verify-domain",
    authMiddleware.guard,
    companyController.verifyDomain
);

export { router };
