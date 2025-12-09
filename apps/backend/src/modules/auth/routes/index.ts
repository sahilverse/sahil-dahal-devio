import { Router } from "express";
import { router as authRoutes } from './auth.route';
import { router as oauthRoutes } from './oauth.route';

const router: Router = Router();


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Email/Password authentication endpoints
 */
router.use('/auth', authRoutes);


/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: OAuth authentication endpoints
 */
router.use('/oauth', oauthRoutes);


export { router };