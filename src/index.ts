import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Import database and routes
import { connectDatabase } from './config/database';
import routes from './routes';
import { setupWebSocket } from './websocket';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Setup WebSockets
setupWebSocket(wss);

// Basic Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// API Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

// Initialize Database and Start Server
const startServer = async () => {
  try {
    await connectDatabase();
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
