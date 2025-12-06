import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './middlewares';
import { CLIENT_URL } from './config/constants';
import routes from './routes';
import { setupSwaggerDocs } from './docs/swagger';


const app: express.Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(compression());
app.use(express.json());

app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}))

// Routes
app.use('/api', routes);

// Swagger Documentation
setupSwaggerDocs(app);

// Error Handling Middleware
app.use(errorHandler);





export default app;



