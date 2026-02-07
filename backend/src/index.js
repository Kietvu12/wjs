import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { sequelize } from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper headers for PDF files
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
import adminRoutes from './routes/adminRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import collaboratorRoutes from './routes/collaboratorRoutes.js';
import collaboratorAssignmentRoutes from './routes/collaboratorAssignmentRoutes.js';
import cvRoutes from './routes/cvRoutes.js';
import cvStorageRoutes from './routes/cvStorageRoutes.js';
import jobCategoryRoutes from './routes/jobCategoryRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import typeRoutes from './routes/typeRoutes.js';
import valueRoutes from './routes/valueRoutes.js';
import jobApplicationRoutes from './routes/jobApplicationRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import postRoutes from './routes/postRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import emailToCompanyRoutes from './routes/emailToCompanyRoutes.js';
import emailToCollaboratorRoutes from './routes/emailToCollaboratorRoutes.js';
import emailToGroupRoutes from './routes/emailToGroupRoutes.js';
import paymentRequestRoutes from './routes/paymentRequestRoutes.js';
import ctvAuthRoutes from './routes/ctvAuthRoutes.js';
import ctvCvRoutes from './routes/ctvCvRoutes.js';
import ctvJobApplicationRoutes from './routes/ctvJobApplicationRoutes.js';
import ctvJobRoutes from './routes/ctvJobRoutes.js';
import ctvFavoriteJobRoutes from './routes/ctvFavoriteJobRoutes.js';
import ctvSearchHistoryRoutes from './routes/ctvSearchHistoryRoutes.js';
import ctvPaymentRequestRoutes from './routes/ctvPaymentRequestRoutes.js';
import ctvDashboardRoutes from './routes/ctvDashboardRoutes.js';
import ctvCampaignRoutes from './routes/ctvCampaignRoutes.js';
import ctvPostRoutes from './routes/ctvPostRoutes.js';
import ctvJobPickupRoutes from './routes/ctvJobPickupRoutes.js';
import ctvScheduleRoutes from './routes/ctvScheduleRoutes.js';
import ctvJobCategoryRoutes from './routes/ctvJobCategoryRoutes.js';
import ctvMessageRoutes from './routes/ctvMessageRoutes.js';

// Admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/groups', groupRoutes);
app.use('/api/admin/collaborators', collaboratorRoutes);
app.use('/api/admin/collaborator-assignments', collaboratorAssignmentRoutes);
app.use('/api/admin/cvs', cvRoutes);
app.use('/api/admin/cv-storages', cvStorageRoutes);
app.use('/api/admin/job-categories', jobCategoryRoutes);
app.use('/api/admin/companies', companyRoutes);
app.use('/api/admin/jobs', jobRoutes);
app.use('/api/admin/types', typeRoutes);
app.use('/api/admin/values', valueRoutes);
app.use('/api/admin/job-applications', jobApplicationRoutes);
app.use('/api/admin/campaigns', campaignRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/posts', postRoutes);
app.use('/api/admin/calendars', calendarRoutes);
app.use('/api/admin/messages', messageRoutes);
app.use('/api/admin/emails/companies', emailToCompanyRoutes);
app.use('/api/admin/emails/collaborators', emailToCollaboratorRoutes);
app.use('/api/admin/emails/groups', emailToGroupRoutes);
app.use('/api/admin/payment-requests', paymentRequestRoutes);

// CTV routes
app.use('/api/ctv/auth', ctvAuthRoutes);
app.use('/api/ctv/cvs', ctvCvRoutes);
app.use('/api/ctv/job-applications', ctvJobApplicationRoutes);
app.use('/api/ctv/jobs', ctvJobRoutes);
app.use('/api/ctv/favorite-jobs', ctvFavoriteJobRoutes);
app.use('/api/ctv/search-history', ctvSearchHistoryRoutes);
app.use('/api/ctv/payment-requests', ctvPaymentRequestRoutes);
app.use('/api/ctv/dashboard', ctvDashboardRoutes);
app.use('/api/ctv/campaigns', ctvCampaignRoutes);
app.use('/api/ctv/posts', ctvPostRoutes);
app.use('/api/ctv/job-pickups', ctvJobPickupRoutes);
app.use('/api/ctv/calendars', ctvScheduleRoutes);
app.use('/api/ctv/job-categories', ctvJobCategoryRoutes);
app.use('/api/ctv/messages', ctvMessageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

// Database connection and server start
const PORT = config.port;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database (use with caution in production)
    // await sequelize.sync({ alter: true });
    // console.log('✅ Database synchronized.');

    // Start payment scheduler
    import('./utils/paymentScheduler.js').then(({ startPaymentScheduler }) => {
      startPaymentScheduler();
    }).catch(err => {
      console.error('❌ Error starting payment scheduler:', err);
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS enabled for: ${config.cors.origin}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

export default app;

