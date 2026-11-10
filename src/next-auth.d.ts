import { DefaultSession } from 'next-auth';
import type { UserRole } from '@/generated/prisma/client';

export type TSessionUser = DefaultSession['user'] & {
    id: number;
    role: UserRole;
};

declare module 'next-auth/jwt' {
    interface JWT {
        userId: number;
        email?: string | null;
        invalid?: boolean;
        /** when the user was last verified against the DB (ms) */
        checkedAt?: number;
        role: UserRole;
    }
}

declare module 'next-auth' {
    interface Session {
        user: TSessionUser;
    }
}
