import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './middlewares';
import { PROD_DOMAIN, CLIENT_URL, NODE_ENV } from './config/constants';
import routes from './routes';
import { setupSwaggerDocs } from './docs/swagger';


const app: express.Application = express();

app.set("trust proxy", 1);

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        if (NODE_ENV !== "production") {
            if (!origin || origin === CLIENT_URL) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS in development"));
        }

        if (!origin || origin.endsWith(PROD_DOMAIN)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS in production"));
        }
    },
    credentials: true,
}));

app.use(helmet());
app.use(cookieParser());
app.use(compression());
app.use(express.json());


// Routes
app.use('/api', routes);

// Swagger Documentation
setupSwaggerDocs(app);

// Error Handling Middleware
app.use(errorHandler);





export default app;



