export const TYPES = {
    RedisManager: Symbol.for("RedisManager"),
    PrismaClient: Symbol.for("PrismaClient"),
    Transporter: Symbol.for("Transporter"),
    MailService: Symbol.for("MailService"),
    TokenService: Symbol.for("TokenService"),

    AuthRepository: Symbol.for("AuthRepository"),
    AuthService: Symbol.for("AuthService"),
    AuthController: Symbol.for("AuthController"),
    AuthMiddleware: Symbol.for("AuthMiddleware"),
    OAuthService: Symbol.for("OAuthService"),
    OAuthController: Symbol.for("OAuthController"),

    UserRepository: Symbol.for("UserRepository"),
    UserService: Symbol.for("UserService"),
    UserController: Symbol.for("UserController"),

    ActivityRepository: Symbol.for("ActivityRepository"),
    ActivityService: Symbol.for("ActivityService"),
    ActivityController: Symbol.for("ActivityController"),

    AuraRepository: Symbol.for("AuraRepository"),
    AuraService: Symbol.for("AuraService"),
    AuraController: Symbol.for("AuraController"),

    VerificationRepository: Symbol.for("VerificationRepository"),
    VerificationService: Symbol.for("VerificationService"),

    QueueService: Symbol.for("QueueService"),
    EmailJobService: Symbol.for("EmailJobService"),
    EmailWorkerService: Symbol.for("EmailWorkerService"),

    SocketService: Symbol.for("SocketService"),
    StorageService: Symbol.for("StorageService"),

    CompanyRepository: Symbol.for("CompanyRepository"),
    CompanyService: Symbol.for("CompanyService"),
    CompanyController: Symbol.for("CompanyController"),

    SkillRepository: Symbol.for("SkillRepository"),
    SkillService: Symbol.for("SkillService"),
    SkillController: Symbol.for("SkillController"),

    TopicRepository: Symbol.for("TopicRepository"),
    TopicService: Symbol.for("TopicService"),
    TopicController: Symbol.for("TopicController"),

    PostRepository: Symbol.for("PostRepository"),
    PostService: Symbol.for("PostService"),
    PostController: Symbol.for("PostController"),

    CommunityRepository: Symbol.for("CommunityRepository"),
    CommunityService: Symbol.for("CommunityService"),
    CommunityController: Symbol.for("CommunityController"),

    CompilerService: Symbol.for("CompilerService"),
    CompilerController: Symbol.for("CompilerController"),
    CompilerSocketHandler: Symbol.for("CompilerSocketHandler"),
    SocketHandler: Symbol.for("SocketHandler"),

    ProblemRepository: Symbol.for("ProblemRepository"),
    ProblemService: Symbol.for("ProblemService"),
    ProblemSyncService: Symbol.for("ProblemSyncService"),
    ProblemController: Symbol.for("ProblemController"),

    ProblemDraftRepository: Symbol.for("ProblemDraftRepository"),
    ProblemDraftService: Symbol.for("ProblemDraftService"),

    SubmissionRepository: Symbol.for("SubmissionRepository"),
    SubmissionService: Symbol.for("SubmissionService"),
    SubmissionController: Symbol.for("SubmissionController"),
    Judge0Service: Symbol.for("Judge0Service"),

    CipherRepository: Symbol.for("CipherRepository"),
    CipherService: Symbol.for("CipherService"),
    CipherController: Symbol.for("CipherController"),
    CipherRouter: Symbol.for("CipherRouter"),
};

export * from "./jwt";
