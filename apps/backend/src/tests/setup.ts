import "reflect-metadata";
import { vi } from "vitest";

/**
 * GLOBAL TESTING SETUP
 */

// 1. Mock the top-level config to prevent container initialization
vi.mock("../config", () => ({
    container: {
        get: vi.fn(),
        bind: vi.fn(() => ({
            to: vi.fn(() => ({ inSingletonScope: vi.fn() })),
            toConstantValue: vi.fn(),
        })),
    },
    prisma: {},
    RedisManager: class { getPub = vi.fn(); },
    transporter: {},
}));

// 2. Mock related modules to prevent them from loading their index/routes/side-effects
vi.mock("../modules/auth/routes", () => ({ router: {} }));
vi.mock("../modules/auth/controllers", () => ({}));
vi.mock("../modules/user", () => ({ UserRepository: class {} }));
vi.mock("../modules/verification", () => ({ VerificationService: class {} }));
vi.mock("../queue", () => ({ EmailJobService: class {} }));

// 3. Global logging silence for cleaner test output
vi.mock("../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));
