export const TYPES = {
    RedisManager: Symbol.for("RedisManager"),
    PrismaClient: Symbol.for("PrismaClient"),
    Transporter: Symbol.for("Transporter"),
    MailService: Symbol.for("MailService"),

    AuthRepository: Symbol.for("AuthRepository"),
    AuthService: Symbol.for("AuthService"),
    AuthController: Symbol.for("AuthController"),
    AuthMiddleware: Symbol.for("AuthMiddleware"),

    UserRepository: Symbol.for("UserRepository"),
    UserService: Symbol.for("UserService"),
    UserController: Symbol.for("UserController"),

    VerificationRepository: Symbol.for("VerificationRepository"),
    VerificationService: Symbol.for("VerificationService"),

    QueueService: Symbol.for("QueueService"),
    EmailJobService: Symbol.for("EmailJobService"),
    EmailWorkerService: Symbol.for("EmailWorkerService"),
};

export * from "./jwt";
