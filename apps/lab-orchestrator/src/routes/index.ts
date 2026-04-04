import express, { Router } from "express";
import { InstanceController } from "../controller/instance.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { z } from "zod";

export const createRouter = (instanceController: InstanceController): express.Router => {
    const router = Router();

    const ProvisionSchema = z.object({
        roomId: z.string().min(1, "Room ID is required"),
        userId: z.string().min(1, "User ID is required"),
        imageId: z.string().min(1, "Image ID is required"),
        dockerfilePath: z.string().optional(),
    });

    const BuildSchema = z.object({
        imageId: z.string().min(1, "Image ID is required"),
        dockerfilePath: z.string().min(1, "Dockerfile path is required"),
    });

    /**
     * @openapi
     * /instances/provision:
     *   post:
     *     tags: [Instances]
     *     summary: Provision a new lab machine
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               roomId:
     *                 type: string
     *               userId:
     *                 type: string
     *               imageId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Machine provisioned successfully
     *       401:
     *         description: Unauthorized
     */
    router.post(
        "/provision",
        validateRequest(ProvisionSchema),
        instanceController.provision
    );

    /**
     * @openapi
     * /instances/build:
     *   post:
     *     tags: [Instances]
     *     summary: Trigger background build for a custom lab image
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               imageId:
     *                 type: string
     *               dockerfilePath:
     *                 type: string
     *     responses:
     *       202:
     *         description: Image build process started in background
     *       401:
     *         description: Unauthorized
     */
    router.post(
        "/build",
        validateRequest(BuildSchema),
        instanceController.buildImage
    );

    /**
     * @openapi
     * /instances/{instanceId}/terminate:
     *   post:
     *     tags: [Instances]
     *     summary: Terminate a running lab machine
     *     parameters:
     *       - in: path
     *         name: instanceId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Machine terminated successfully
     *       401:
     *         description: Unauthorized
     */
    router.post(
        "/:instanceId/terminate",
        instanceController.terminate
    );

    /**
     * @openapi
     * /instances/{instanceId}/status:
     *   get:
     *     tags: [Instances]
     *     summary: Get the status of a lab machine
     *     parameters:
     *       - in: path
     *         name: instanceId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Status retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    router.get(
        "/:instanceId/status",
        instanceController.status
    );

    return router;
};
