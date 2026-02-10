import dotenv from 'dotenv';

dotenv.config();

export default {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'job_share_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // CORS - cho phép localhost và IP nội bộ khi chạy host (live local)
  cors: {
    origin: (() => {
      const envOrigin = process.env.CORS_ORIGIN;
      if (envOrigin) {
        return envOrigin.includes(',') ? envOrigin.split(',').map(s => s.trim()) : envOrigin;
      }
      const isDev = (process.env.NODE_ENV || 'development') === 'development';
      if (isDev) {
        return (origin, callback) => {
          if (!origin) return callback(null, true);
          const allowed = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
          callback(null, allowed);
        };
      }
      return 'http://localhost:5173';
    })()
  },
  
  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  
  // Email
  email: {
    from: process.env.EMAIL_FROM || 'kietvu389@gmail.com',
    fromName: process.env.EMAIL_FROM_NAME || 'JobShare System',
    user: process.env.EMAIL_USER || 'kietvu389@gmail.com',
    password: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD,
    service: process.env.EMAIL_SERVICE || 'gmail' // 'gmail' or 'outlook'
  }
};

