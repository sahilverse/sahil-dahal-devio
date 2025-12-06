import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../config/constants';

export class BcryptUtils {
    private static readonly saltRounds = SALT_ROUNDS;

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}
