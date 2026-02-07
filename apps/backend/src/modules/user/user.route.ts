import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { UserController } from "./user.controller";
import { AuthMiddleware, validateRequest, upload } from "../../middlewares";
import {
    onboardingSchema,
    updateProfileSchema,
    updateNamesSchema,
    createExperienceSchema,
    updateExperienceSchema,
    createEducationSchema,
    updateEducationSchema,
    createUserSkillSchema,
    createCertificationSchema,
    updateCertificationSchema,
    createProjectSchema,
    updateProjectSchema
} from "@devio/zod-utils";

const router: Router = Router();

const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const userController = container.get<UserController>(TYPES.UserController);

/**
 * @swagger
 * components:
 *   schemas:
 *     EmploymentType:
 *       type: string
 *       enum: [FULL_TIME, PART_TIME, SELF_EMPLOYED, FREELANCE, CONTRACT, INTERNSHIP, APPRENTICESHIP, SEASONAL]
 *     CreateExperienceInput:
 *       type: object
 *       required: [title, companyName, startDate]
 *       properties:
 *         title: { type: string, minLength: 2, maxLength: 100 }
 *         companyName: { type: string, minLength: 2, maxLength: 100 }
 *         companyId: { type: string, nullable: true }
 *         location: { type: string, maxLength: 100, nullable: true }
 *         type: { $ref: '#/components/schemas/EmploymentType', nullable: true }
 *         startDate: { type: string, format: date }
 *         endDate: { type: string, format: date, nullable: true }
 *         isCurrent: { type: boolean, default: false }
 *         description: { type: string, maxLength: 2000, nullable: true }
 *     UpdateExperienceInput:
 *       $ref: '#/components/schemas/CreateExperienceInput'
 *     CreateEducationInput:
 *       type: object
 *       required: [school, startDate]
 *       properties:
 *         school: { type: string, minLength: 2, maxLength: 100 }
 *         degree: { type: string, maxLength: 100, nullable: true }
 *         fieldOfStudy: { type: string, maxLength: 100, nullable: true }
 *         startDate: { type: string, format: date }
 *         endDate: { type: string, format: date, nullable: true }
 *         grade: { type: string, maxLength: 50, nullable: true }
 *         activities: { type: string, maxLength: 500, nullable: true }
 *         description: { type: string, maxLength: 2000, nullable: true }
 *     UpdateEducationInput:
 *       $ref: '#/components/schemas/CreateEducationInput'
 *     CreateCertificationInput:
 *       type: object
 *       required: [name, issuingOrg, issueDate]
 *       properties:
 *         name: { type: string, minLength: 3, maxLength: 100, example: "Certified Ethical Hacker" }
 *         issuingOrg: { type: string, minLength: 2, maxLength: 100, example: "EC-Council" }
 *         issueDate: { type: string, format: date, example: "2024-01-15" }
 *         expirationDate: { type: string, format: date, nullable: true, example: "2027-01-15" }
 *         credentialId: { type: string, maxLength: 100, nullable: true, example: "CEH-12345" }
 *         credentialUrl: { type: string, format: uri, nullable: true, example: "https://verify.eccouncil.org/ceh-12345" }
 *     UpdateCertificationInput:
 *       $ref: '#/components/schemas/CreateCertificationInput'
 *     CreateProjectInput:
 *       type: object
 *       required: [title, startDate]
 *       properties:
 *         title: { type: string, minLength: 2, maxLength: 100, example: "E-Commerce Platform" }
 *         description: { type: string, maxLength: 2000, nullable: true, example: "A full-stack e-commerce solution." }
 *         url: { type: string, format: uri, nullable: true, example: "https://github.com/user/project" }
 *         startDate: { type: string, format: date, example: "2023-01-01" }
 *         endDate: { type: string, format: date, nullable: true, example: "2023-06-01" }
 *         skills: { type: array, items: { type: string }, example: ["React", "Node.js", "Prisma"] }
 *     UpdateProjectInput:
 *       $ref: '#/components/schemas/CreateProjectInput'
 */


/**
 * @swagger
 * /users/onboarding:
 *   patch:
 *     summary: Complete user profile onboarding
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username already taken
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/onboarding",
    authMiddleware.guard,
    validateRequest(onboardingSchema),
    userController.completeOnboarding
);

router.get(
    "/:username",
    authMiddleware.extractUser,
    userController.getProfile
);

/**
 * @swagger
 * /users/{username}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Already following
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:username/follow",
    authMiddleware.guard,
    userController.followUser
);

/**
 * @swagger
 * /users/{username}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:username/follow",
    authMiddleware.guard,
    userController.unfollowUser
);

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 */
router.post(
    "/avatar",
    authMiddleware.guard,
    upload.single("avatar"),
    userController.uploadAvatar
);

/**
 * @swagger
 * /users/avatar:
 *   delete:
 *     summary: Remove user avatar
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 */
router.delete(
    "/avatar",
    authMiddleware.guard,
    userController.removeAvatar
);

/**
 * @swagger
 * /users/banner:
 *   post:
 *     summary: Upload user banner
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Banner updated successfully
 */
router.post(
    "/banner",
    authMiddleware.guard,
    upload.single("banner"),
    userController.uploadBanner
);

/**
 * @swagger
 * /users/banner:
 *   delete:
 *     summary: Remove user banner
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Banner removed successfully
 */
router.delete(
    "/banner",
    authMiddleware.guard,
    userController.removeBanner
);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update user profile details
 *     description: Updates the user's title, city, country, and socials.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               city:
 *                 type: string
 *                 maxLength: 50
 *               country:
 *                 type: string
 *                 maxLength: 50
 *               socials:
 *                 type: object
 *                 properties:
 *                   github:
 *                     type: string
 *                     format: uri
 *                   linkedin:
 *                     type: string
 *                     format: uri
 *                   twitter:
 *                     type: string
 *                     format: uri
 *                   facebook:
 *                     type: string
 *                     format: uri
 *                   instagram:
 *                     type: string
 *                     format: uri
 *                   youtube:
 *                     type: string
 *                     format: uri
 *                   website:
 *                     type: string
 *                     format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/profile",
    authMiddleware.guard,
    validateRequest(updateProfileSchema),
    userController.updateProfile
);

/**
 * @swagger
 * /users/names:
 *   patch:
 *     summary: Update user first and last names
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Names updated successfully
 */
router.patch(
    "/names",
    authMiddleware.guard,
    validateRequest(updateNamesSchema),
    userController.updateNames
);

/**
 * @swagger
 * /users/experiences:
 *   post:
 *     summary: Add user experience
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExperienceInput'
 *     responses:
 *       201:
 *         description: Experience added successfully
 */
router.post(
    "/experiences",
    authMiddleware.guard,
    validateRequest(createExperienceSchema),
    userController.addExperience
);

/**
 * @swagger
 * /users/experiences/{id}:
 *   patch:
 *     summary: Update user experience
 *     tags: [User]
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
 *             $ref: '#/components/schemas/UpdateExperienceInput'
 *     responses:
 *       200:
 *         description: Experience updated successfully
 */
router.patch(
    "/experiences/:id",
    authMiddleware.guard,
    validateRequest(updateExperienceSchema),
    userController.updateExperience
);

/**
 * @swagger
 * /users/experiences/{id}:
 *   delete:
 *     summary: Remove user experience
 *     tags: [User]
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
 *         description: Experience removed successfully
 */
router.delete(
    "/experiences/:id",
    authMiddleware.guard,
    userController.removeExperience
);

/**
 * @swagger
 * /users/educations:
 *   post:
 *     summary: Add user education
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEducationInput'
 *     responses:
 *       201:
 *         description: Education added successfully
 */
router.post(
    "/educations",
    authMiddleware.guard,
    validateRequest(createEducationSchema),
    userController.addEducation
);

/**
 * @swagger
 * /users/educations/{id}:
 *   patch:
 *     summary: Update user education
 *     tags: [User]
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
 *             $ref: '#/components/schemas/UpdateEducationInput'
 *     responses:
 *       200:
 *         description: Education updated successfully
 */
router.patch(
    "/educations/:id",
    authMiddleware.guard,
    validateRequest(updateEducationSchema),
    userController.updateEducation
);

/**
 * @swagger
 * /users/educations/{id}:
 *   delete:
 *     summary: Remove user education
 *     tags: [User]
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
 *         description: Education removed successfully
 */
router.delete(
    "/educations/:id",
    authMiddleware.guard,
    userController.removeEducation
);

/**
 * @swagger
 * /users/skills:
 *   post:
 *     summary: Add user skill
 *     tags: [User]
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
 *         description: Skill added successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Skill already added
 */
router.post(
    "/skills",
    authMiddleware.guard,
    validateRequest(createUserSkillSchema),
    userController.addSkill
);

/**
 * @swagger
 * /users/skills/{id}:
 *   delete:
 *     summary: Remove user skill
 *     tags: [User]
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
 *         description: Skill removed successfully
 *       404:
 *         description: Skill not found
 */
router.delete(
    "/skills/:id",
    authMiddleware.guard,
    userController.removeSkill
);



/**
 * @swagger
 * /users/certifications:
 *   post:
 *     summary: Add certification
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCertificationInput'
 *     responses:
 *       201:
 *         description: Certification added successfully
 *       400:
 *         description: Bad request
 */
router.post(
    "/certifications",
    authMiddleware.guard,
    validateRequest(createCertificationSchema),
    userController.addCertification
);



/**
 * @swagger
 * /users/certifications/{id}:
 *   patch:
 *     summary: Update certification
 *     tags: [User]
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
 *             $ref: '#/components/schemas/UpdateCertificationInput'
 *     responses:
 *       200:
 *         description: Certification updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Certification not found
 */
router.patch(
    "/certifications/:id",
    authMiddleware.guard,
    validateRequest(updateCertificationSchema),
    userController.updateCertification
);

/**
 * @swagger
 * /users/certifications/{id}:
 *   delete:
 *     summary: Remove certification
 *     tags: [User]
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
 *         description: Certification removed successfully
 */
router.delete(
    "/certifications/:id",
    authMiddleware.guard,
    userController.removeCertification
);

/**
 * @swagger
 * /users/projects:
 *   post:
 *     summary: Add user project
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectInput'
 *     responses:
 *       201:
 *         description: Project added successfully
 *       400:
 *         description: Bad request
 */
router.post(
    "/projects",
    authMiddleware.guard,
    validateRequest(createProjectSchema),
    userController.addProject
);

/**
 * @swagger
 * /users/projects/{id}:
 *   patch:
 *     summary: Update user project
 *     tags: [User]
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
 *             $ref: '#/components/schemas/UpdateProjectInput'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.patch(
    "/projects/:id",
    authMiddleware.guard,
    validateRequest(updateProjectSchema),
    userController.updateProject
);

/**
 * @swagger
 * /users/projects/{id}:
 *   delete:
 *     summary: Remove user project
 *     tags: [User]
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
 *         description: Project removed successfully
 *       404:
 *         description: Project not found
 */
router.delete(
    "/projects/:id",
    authMiddleware.guard,
    userController.removeProject
);

export { router };
