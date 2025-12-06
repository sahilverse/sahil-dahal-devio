import { Container } from "inversify";
import { TYPES } from "../types";
import { RedisManager } from "./redis";
import { AuthService, AuthController, AuthRepository } from "../modules/auth";
import { UserRepository } from "../modules/user";
import { prisma } from "./prisma";

const container = new Container();

container.bind<RedisManager>(TYPES.RedisManager).to(RedisManager).inSingletonScope();
container.bind<typeof prisma>(TYPES.PrismaClient).toConstantValue(prisma);

container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();

container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

export { container };
