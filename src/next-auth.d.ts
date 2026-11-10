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
        role: UserRole;
    }
}

declare module 'next-auth' {
    interface Session {
        user: TSessionUser;
    }
}
