export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
export const PORT = process.env.PORT || 8000;
export const SALT_ROUNDS = 12;

export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const DATABASE_URL = process.env.DATABASE_URL!;

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const JWT_ACCESS_EXPIRATION_MINUTES = Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) || 15;
export const JWT_REFRESH_EXPIRATION_DAYS = Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) || 7;

export const JWT_RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET!;
export const JWT_RESET_PASSWORD_EXPIRATION_MINUTES = Number(process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES) || 5;

export const REFRESH_TOKEN_PREFIX = "refresh_jti:";
