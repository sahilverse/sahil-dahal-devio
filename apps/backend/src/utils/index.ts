export * from './ApiError';
export * from './asyncHandler';
export * from './logger';
export * from './response';
export * from './bcrypt';
export * from './jwt';


export const removePasswordFromUser = <T extends { password?: string }>(obj: T): Omit<T, 'password'> => {
    const { password, ...rest } = obj;
    return rest;
}