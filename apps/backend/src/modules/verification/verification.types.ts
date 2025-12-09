import { CodeType } from "../../generated/prisma/enums";

export interface CreateVerificationTokenPayload {
    userId: string;
    code: string;
    type: CodeType;
    expiresAt: Date;
}
