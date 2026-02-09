import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const PORT = process.env.PORT || 5000;

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Code Sandbox API Documentation",
            version: "1.0.0",
            description: "API documentation for the Code Sandbox code execution service",
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: "Local development server",
            },
        ],
        tags: [
            { name: "Session", description: "Code execution session management" },
            { name: "Pool", description: "Docker container pool management" },
            { name: "Languages", description: "Supported programming languages" },
        ],
    },
    apis: ["./src/**/*.{ts,js}"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwaggerDocs = (app: express.Application) => {
    app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
