import 'server-only';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireFullAdmin } from '@/lib/dal/auth';
import { AppError, ValidationError } from '@/lib/errors';
import type { TUser, TUserRole } from '@/types';

const ROLES: TUserRole[] = ['ROLE_ADMIN', 'ROLE_FULL_ADMIN'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRole(value: unknown): TUserRole {
    if (!ROLES.includes(value as TUserRole)) throw new ValidationError('Invalid role');
    return value as TUserRole;
}

export async function listUsers(): Promise<TUser[]> {
    await getCurrentUser();
    return prisma.user.findMany({ orderBy: { id: 'asc' }, select: { id: true, email: true, role: true } });
}

export async function createUser(input: { email?: unknown; role?: unknown }): Promise<TUser> {
    await requireFullAdmin();
    const email = String(input.email ?? '')
        .trim()
        .toLowerCase();
    if (!EMAIL_RE.test(email)) throw new ValidationError('Invalid email');
    const role = parseRole(input.role ?? 'ROLE_ADMIN');

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError('A user with this email already exists', 409);

    return prisma.user.create({ data: { email, role }, select: { id: true, email: true, role: true } });
}

export async function updateUserRole(id: number, roleValue: unknown): Promise<TUser> {
    const me = await requireFullAdmin();
    if (me.id === id) throw new AppError('You cannot change your own role', 400);
    return prisma.user.update({
        where: { id },
        data: { role: parseRole(roleValue) },
        select: { id: true, email: true, role: true },
    });
}

export async function deleteUser(id: number) {
    const me = await requireFullAdmin();
    if (me.id === id) throw new AppError('You cannot remove yourself', 400);
    await prisma.user.delete({ where: { id } });
}
