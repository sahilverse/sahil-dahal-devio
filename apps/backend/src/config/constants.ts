export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
export const PORT = process.env.PORT || 8000;
export const SALT_ROUNDS = 12;

export const CLIENT_URL = process.env.CLIENT_URL!;
export const REDIS_URL = process.env.REDIS_URL!;
export const DATABASE_URL = process.env.DATABASE_URL!;

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const JWT_ACCESS_EXPIRATION_MINUTES = Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) || 15;
export const JWT_REFRESH_EXPIRATION_DAYS = Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) || 7;

export const JWT_RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET!;
export const JWT_RESET_PASSWORD_EXPIRATION_MINUTES = Number(process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES) || 5;

export const REFRESH_TOKEN_PREFIX = "refresh_jti:";
export const RESET_PASSWORD_SESSION_TOKEN_PREFIX = "reset_password_session:";

export const SMTP_EMAIL_USER = process.env.SMTP_EMAIL_USER!;
export const SMTP_EMAIL_PASS = process.env.SMTP_EMAIL_PASS!;

export const JWT_EMAIL_VERIFICATION_SECRET = process.env.JWT_EMAIL_VERIFICATION_SECRET!;
export const JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES = Number(process.env.JWT_EMAIL_VERIFICATION_EXPIRATION_MINUTES) || 10;

export const EMAIL_JOB_TYPES = {
    VERIFICATION: "verification",
    PASSWORD_RESET: "passwordReset",
} as const;

export type EmailJobType = typeof EMAIL_JOB_TYPES[keyof typeof EMAIL_JOB_TYPES];

// OAuth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
export const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI!;

// MinIO / S3
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "http://localhost:9000";
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY!;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY!;
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';

export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "devio-uploads";
export const MINIO_BUCKET_PROBLEMS = process.env.MINIO_BUCKET_PROBLEMS || "devio-problems";

export const CODE_SANDBOX_URL = process.env.CODE_SANDBOX_URL || 'http://localhost:5000';

// Problem Redis Keys & TTL
export const PROBLEM_REDIS_TTL = 60 * 60 * 24 * 7;
export const PROBLEM_REDIS_KEYS = {
    SAMPLES: (slug: string) => `problem:${slug}:samples`,
    BOILERPLATES: (slug: string) => `problem:${slug}:boilerplates`,
    FULL_BOILERPLATES: (slug: string) => `problem:${slug}:boilerplates:full`,
} as const;
