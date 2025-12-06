import { Container } from "inversify";
import { TYPES } from "../types";
import { RedisManager } from "./redis";
import { AuthService, AuthController } from "../modules/auth";
import { UserRepository } from "../modules/user";


const container = new Container();

container.bind<RedisManager>(TYPES.RedisManager).to(RedisManager).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();


export { container };
