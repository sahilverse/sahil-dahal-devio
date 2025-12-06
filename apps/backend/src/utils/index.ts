export * from './ApiError';
export * from './asyncHandler';
export * from './logger';
export * from './response';
export * from './bcrypt';
export * from './jwt';

import type { User } from '../generated/prisma/client';

export const removePasswordFromUser = (user: User): Omit<User, 'password'> => {
    const { password, ...rest } = user;
    return rest;
};
