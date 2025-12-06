import { Container } from "inversify";
import { TYPES } from "../types";
import { RedisManager } from "./redis";


const container = new Container();

container.bind<RedisManager>(TYPES.RedisManager).to(RedisManager).inSingletonScope();

export { container };
