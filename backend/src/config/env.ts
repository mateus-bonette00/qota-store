import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/qota_finance',
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:4200',
  
  // Amazon SP-API (opcional)
  spapi: {
    refreshToken: process.env.SPAPI_REFRESH_TOKEN || '',
    clientId: process.env.LWA_CLIENT_ID || '',
    clientSecret: process.env.LWA_CLIENT_SECRET || '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    roleArn: process.env.AWS_ROLE_ARN || '',
  },
  
  // JWT (para autenticação futura)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Application
  app: {
    name: process.env.APP_NAME || 'Qota Finance API',
    version: process.env.APP_VERSION || '1.0.0',
  }
} as const;

// Validar configurações críticas
const validateConfig = () => {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL não configurada');
  }
  
  console.log('✅ Configurações carregadas com sucesso');
};

validateConfig();

export default config;