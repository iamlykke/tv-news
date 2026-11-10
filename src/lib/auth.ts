import 'server-only';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';

/** Почты из ADMIN_EMAILS при входе автоматически получают Full Admin — так впускаем первого админа. */
function bootstrapAdmins(): Set<string> {
    return new Set(
        (process.env.ADMIN_EMAILS ?? '')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean),
    );
}

async function findUser(email: string) {
    return prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } });
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: { params: { prompt: 'select_account' } },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async signIn({ user, profile }) {
            const email = user.email?.toLowerCase();
            if (!email) return false;
            if ((profile as { email_verified?: boolean } | undefined)?.email_verified === false) return false;

            if (bootstrapAdmins().has(email)) {
                await prisma.user.upsert({
                    where: { email },
                    update: { role: 'ROLE_FULL_ADMIN' },
                    create: { email, role: 'ROLE_FULL_ADMIN' },
                });
                return true;
            }

            // Пускаем только тех, кого добавили в «Администраторы»
            return !!(await findUser(email));
        },
        async jwt({ token, user }) {
            try {
                // При каждом обращении сверяемся с БД: удалённый админ теряет доступ сразу
                const email = (user?.email ?? token.email)?.toLowerCase();
                const dbUser = email ? await findUser(email) : null;
                if (!dbUser) {
                    token.invalid = true;
                } else {
                    token.invalid = false;
                    token.userId = dbUser.id;
                    token.email = dbUser.email;
                    token.role = dbUser.role;
                }
            } catch (error) {
                console.error('[auth] failed to check user in DB', error);
                token.invalid = true;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.invalid || !session.user) return { ...session, user: undefined } as never;
            session.user.id = token.userId;
            session.user.role = token.role;
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith(`${baseUrl}/admin`) || url.startsWith('/admin')) {
                return url.startsWith('/') ? `${baseUrl}${url}` : url;
            }
            return `${baseUrl}/admin`;
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 14 * 86400,
        updateAge: 6 * 3600,
    },
};
