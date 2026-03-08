import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import { config } from "../config/env";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Lab Orchestrator API Documentation",
            version: "1.0.0",
            description: "API documentation for the Lab Orchestrator container provisioning module.",
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api`,
                description: "Local development server",
            },
        ],
        tags: [
            { name: "Instances", description: "Container lifecycle management (provision/terminate)" },
        ],
    },
    apis: ["./src/routes/**/*.{ts,js}", "./src/controller/**/*.{ts,js}"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwaggerDocs = (app: express.Application) => {
    app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
