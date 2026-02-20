import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CompanyController } from "./company.controller";
import { AuthMiddleware, upload } from "../../middlewares";

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
 * /companies/managed:
 *   get:
 *     summary: Get companies managed by the authenticated user
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Managed companies fetched successfully
 */
router.get(
    "/managed",
    authMiddleware.guard,
    companyController.getManagedCompanies
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

/**
 * @swagger
 * /companies/{id}/logo:
 *   post:
 *     summary: Upload company logo
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Company logo uploaded successfully
 *       400:
 *         description: No file uploaded
 *       403:
 *         description: Unauthorized
 */
router.post(
    "/:id/logo",
    authMiddleware.guard,
    upload.single("logo"),
    companyController.uploadLogo
);

/**
 * @swagger
 * /companies/{id}/logo:
 *   delete:
 *     summary: Remove company logo
 *     tags: [Company]
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
 *         description: Company logo removed successfully
 *       403:
 *         description: Unauthorized
 */
router.delete(
    "/:id/logo",
    authMiddleware.guard,
    companyController.removeLogo
);

export { router };
