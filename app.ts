
import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import coursRoutes from "./routes/cours.route"; 
import modulesRoutes from "./routes/modules.route"; 
import lessonsRoutes from "./routes/lessons.route" ; 
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";


const   swaggerJsdoc = require("swagger-jsdoc");
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

const apicache = require('apicache');
const cache = apicache.middleware;

app.use(bodyParser.json());
const compression = require('compression');
app.use(compression());
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", 
    info: {
      title: "Express API Documentation",
      version: "1.0.0",
      description: "API documentation for the Express app",
      contact: {
        name: "Yassine Ben Salah",
        email: "yacinbnsalh@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
  },
  apis: ["routes/*.ts"],
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api", coursRoutes);
app.use("/api-modules", modulesRoutes);
app.use("/", lessonsRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});