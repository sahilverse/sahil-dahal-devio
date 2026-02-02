import { Container } from "inversify";
import { TYPES } from "../types";
import { RedisManager } from "./redis";
import { AuthService, AuthController, AuthRepository, TokenService, OAuthService, OAuthController } from "../modules/auth";
import { UserRepository, UserService, UserController } from "../modules/user";
import { prisma } from "./prisma";
import { AuthMiddleware } from "../middlewares";
import type { Transporter } from "nodemailer";
import { MailService } from "../modules/mail";
import { VerificationRepository, VerificationService } from "../modules/verification";
import { QueueService, EmailJobService, EmailWorkerService } from "../queue";
import { SocketService } from "../modules/socket";
import { transporter } from "./transporter";


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

container.bind(TYPES.VerificationRepository).to(VerificationRepository).inSingletonScope();
container.bind(TYPES.VerificationService).to(VerificationService).inSingletonScope();

container.bind<QueueService>(TYPES.QueueService).to(QueueService).inSingletonScope();
container.bind<EmailJobService>(TYPES.EmailJobService).to(EmailJobService).inSingletonScope();
container.bind<EmailWorkerService>(TYPES.EmailWorkerService).to(EmailWorkerService).inSingletonScope();

container.bind(TYPES.SocketService).to(SocketService).inSingletonScope();


export { container };
