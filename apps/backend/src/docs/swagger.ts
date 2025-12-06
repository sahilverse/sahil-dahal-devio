import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import { PORT } from "../config/constants";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Devio API Documentation",
            version: "1.0.0",
            description: "API documentation for Devio application",
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/**/*.{ts,js}"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwaggerDocs = (app: express.Application) => {
    app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};