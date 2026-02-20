import { Container } from "inversify";
import { TYPES } from "../types";
import { RedisManager } from "./redis";
import { AuthService, AuthController, AuthRepository, TokenService, OAuthService, OAuthController } from "../modules/auth";
import { UserRepository, UserService, UserController } from "../modules/user";
import { CompanyRepository, CompanyService, CompanyController } from "../modules/company";
import { JobRepository, JobService, JobController } from "../modules/job";
import { ActivityRepository, ActivityService, ActivityController } from "../modules/activity";
import { AuraRepository, AuraService, AuraController } from "../modules/aura";
import { SkillRepository, SkillService, SkillController } from "../modules/skill";
import { TopicRepository, TopicService, TopicController } from "../modules/topic";
import { PostRepository } from "../modules/post/post.repository";
import { PostService } from "../modules/post/post.service";
import { PostController } from "../modules/post/post.controller";
import { prisma } from "./prisma";
import { AuthMiddleware, EventGuard } from "../middlewares";
import type { Transporter } from "nodemailer";
import { MailService } from "../modules/mail";
import { VerificationRepository, VerificationService } from "../modules/verification";
import { QueueService, EmailJobService, EmailWorkerService } from "../queue";
import { SocketService } from "../modules/socket";
import { ISocketHandler } from "../modules/socket";
import { StorageService } from "../modules/storage";
import { transporter } from "./transporter";
import { CommunityRepository, CommunityService, CommunityController } from "../modules/community";
import { CompilerService, CompilerController, CompilerSocketHandler } from "../modules/compiler";
import { ProblemRepository, ProblemService, ProblemSyncService, ProblemController, ProblemDraftRepository, ProblemDraftService } from "../modules/problem";
import { SubmissionService, SubmissionController, Judge0Service, SubmissionRepository } from "../modules/submission";
import { CipherRepository, CipherService, CipherController } from "../modules/cipher";
import { AchievementRepository, AchievementService } from "../modules/achievement";
import { CommentRepository, CommentService, CommentController } from "../modules/comment";
import { NotificationRepository, NotificationService, NotificationController } from "../modules/notification";
import { MentionService } from "../modules/mention/mention.service";
import { ConversationRepository, ConversationService, ConversationController } from "../modules/conversation";
import { ConversationSocketHandler } from "../modules/conversation/conversation.socket";
import { EventRepository, EventService, EventController } from "../modules/event";
import { EventSocketHandler } from "../modules/event/event.socket";


const container = new Container();

container.bind<RedisManager>(TYPES.RedisManager).to(RedisManager).inSingletonScope();
container.bind<typeof prisma>(TYPES.PrismaClient).toConstantValue(prisma);

container.bind<Transporter>(TYPES.Transporter).toConstantValue(transporter);
container.bind<MailService>(TYPES.MailService).to(MailService).inSingletonScope();

container.bind<TokenService>(TYPES.TokenService).to(TokenService).inSingletonScope();

container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();
container.bind<OAuthService>(TYPES.OAuthService).to(OAuthService).inSingletonScope();
container.bind<OAuthController>(TYPES.OAuthController).to(OAuthController).inSingletonScope();

container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<UserController>(TYPES.UserController).to(UserController).inSingletonScope();

container.bind<ActivityRepository>(TYPES.ActivityRepository).to(ActivityRepository).inSingletonScope();
container.bind<ActivityService>(TYPES.ActivityService).to(ActivityService).inSingletonScope();
container.bind<ActivityController>(TYPES.ActivityController).to(ActivityController).inSingletonScope();

container.bind<AuraRepository>(TYPES.AuraRepository).to(AuraRepository).inSingletonScope();
container.bind<AuraService>(TYPES.AuraService).to(AuraService).inSingletonScope();
container.bind<AuraController>(TYPES.AuraController).to(AuraController).inSingletonScope();

container.bind<CompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository).inSingletonScope();
container.bind<CompanyService>(TYPES.CompanyService).to(CompanyService).inSingletonScope();
container.bind<CompanyController>(TYPES.CompanyController).to(CompanyController).inSingletonScope();

container.bind<SkillRepository>(TYPES.SkillRepository).to(SkillRepository).inSingletonScope();
container.bind<SkillService>(TYPES.SkillService).to(SkillService).inSingletonScope();
container.bind<SkillController>(TYPES.SkillController).to(SkillController).inSingletonScope();

container.bind<JobRepository>(TYPES.JobRepository).to(JobRepository).inSingletonScope();
container.bind<JobService>(TYPES.JobService).to(JobService).inSingletonScope();
container.bind<JobController>(TYPES.JobController).to(JobController).inSingletonScope();

container.bind<TopicRepository>(TYPES.TopicRepository).to(TopicRepository).inSingletonScope();
container.bind<TopicService>(TYPES.TopicService).to(TopicService).inSingletonScope();
container.bind<TopicController>(TYPES.TopicController).to(TopicController).inSingletonScope();

container.bind<PostRepository>(TYPES.PostRepository).to(PostRepository).inSingletonScope();
container.bind<PostService>(TYPES.PostService).to(PostService).inSingletonScope();
container.bind<PostController>(TYPES.PostController).to(PostController).inSingletonScope();

container.bind<CommunityRepository>(TYPES.CommunityRepository).to(CommunityRepository).inSingletonScope();
container.bind<CommunityService>(TYPES.CommunityService).to(CommunityService).inSingletonScope();
container.bind<CommunityController>(TYPES.CommunityController).to(CommunityController).inSingletonScope();

container.bind(TYPES.VerificationRepository).to(VerificationRepository).inSingletonScope();
container.bind(TYPES.VerificationService).to(VerificationService).inSingletonScope();

container.bind<QueueService>(TYPES.QueueService).to(QueueService).inSingletonScope();
container.bind<EmailJobService>(TYPES.EmailJobService).to(EmailJobService).inSingletonScope();
container.bind<EmailWorkerService>(TYPES.EmailWorkerService).to(EmailWorkerService).inSingletonScope();

container.bind(TYPES.SocketService).to(SocketService).inSingletonScope();
container.bind<StorageService>(TYPES.StorageService).to(StorageService).inSingletonScope();

container.bind<CompilerService>(TYPES.CompilerService).to(CompilerService).inSingletonScope();
container.bind<CompilerController>(TYPES.CompilerController).to(CompilerController).inSingletonScope();
container.bind<CompilerSocketHandler>(TYPES.CompilerSocketHandler).to(CompilerSocketHandler).inSingletonScope();
container.bind<ISocketHandler>(TYPES.SocketHandler).to(CompilerSocketHandler).inSingletonScope();

container.bind<ProblemRepository>(TYPES.ProblemRepository).to(ProblemRepository).inSingletonScope();
container.bind<ProblemService>(TYPES.ProblemService).to(ProblemService).inSingletonScope();
container.bind<ProblemSyncService>(TYPES.ProblemSyncService).to(ProblemSyncService).inSingletonScope();

container.bind<Judge0Service>(TYPES.Judge0Service).to(Judge0Service).inSingletonScope();
container.bind<SubmissionRepository>(TYPES.SubmissionRepository).to(SubmissionRepository).inSingletonScope();
container.bind<SubmissionService>(TYPES.SubmissionService).to(SubmissionService).inSingletonScope();
container.bind<SubmissionController>(TYPES.SubmissionController).to(SubmissionController).inSingletonScope();
container.bind<ProblemController>(TYPES.ProblemController).to(ProblemController).inSingletonScope();

container.bind<CipherRepository>(TYPES.CipherRepository).to(CipherRepository).inSingletonScope();
container.bind<CipherService>(TYPES.CipherService).to(CipherService).inSingletonScope();
container.bind<CipherController>(TYPES.CipherController).to(CipherController).inSingletonScope();



container.bind<ProblemDraftRepository>(TYPES.ProblemDraftRepository).to(ProblemDraftRepository).inSingletonScope();
container.bind<ProblemDraftService>(TYPES.ProblemDraftService).to(ProblemDraftService).inSingletonScope();

container.bind<AchievementRepository>(TYPES.AchievementRepository).to(AchievementRepository).inSingletonScope();
container.bind<AchievementService>(TYPES.AchievementService).to(AchievementService).inSingletonScope();

container.bind<CommentRepository>(TYPES.CommentRepository).to(CommentRepository).inSingletonScope();
container.bind<CommentService>(TYPES.CommentService).to(CommentService).inSingletonScope();
container.bind<CommentController>(TYPES.CommentController).to(CommentController).inSingletonScope();

container.bind<NotificationRepository>(TYPES.NotificationRepository).to(NotificationRepository).inSingletonScope();
container.bind<NotificationService>(TYPES.NotificationService).to(NotificationService).inSingletonScope();
container.bind<NotificationController>(TYPES.NotificationController).to(NotificationController).inSingletonScope();

container.bind<MentionService>(TYPES.MentionService).to(MentionService).inSingletonScope();

container.bind<ConversationRepository>(TYPES.ConversationRepository).to(ConversationRepository).inSingletonScope();
container.bind<ConversationService>(TYPES.ConversationService).to(ConversationService).inSingletonScope();
container.bind<ConversationController>(TYPES.ConversationController).to(ConversationController).inSingletonScope();
container.bind<ISocketHandler>(TYPES.SocketHandler).to(ConversationSocketHandler).inSingletonScope();

container.bind<EventController>(TYPES.EventController).to(EventController).inSingletonScope();
container.bind<EventGuard>(TYPES.EventGuard).to(EventGuard).inSingletonScope();
container.bind<EventRepository>(TYPES.EventRepository).to(EventRepository).inSingletonScope();
container.bind<EventService>(TYPES.EventService).to(EventService).inSingletonScope();
container.bind<EventSocketHandler>(TYPES.EventSocketHandler).to(EventSocketHandler).inSingletonScope();
container.bind<ISocketHandler>(TYPES.SocketHandler).to(EventSocketHandler).inSingletonScope();


export { container };
