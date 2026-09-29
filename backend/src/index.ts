import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { db } from './db/connection.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: [ENV.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Faculty Housing Management System (FHMS) API',
    version: '2.0.0',
    database: db.isMySQL() ? 'MySQL (Production)' : 'Embedded In-Memory Store (Dev/Offline Mode)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`
    }
  });
});

// Central Error Handler
app.use(errorHandler);

// Server startup
async function startServer() {
  await db.connect();

  app.listen(ENV.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 FHMS API Server running on port ${ENV.PORT}`);
    console.log(`🌐 Health check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`🗄️ Database mode: ${db.isMySQL() ? 'MySQL Server' : 'In-Memory/Dev Store'}`);
    console.log(`====================================================`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
