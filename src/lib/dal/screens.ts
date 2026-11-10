import 'server-only';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireFullAdmin } from '@/lib/dal/auth';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import type { TScreen } from '@/types';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
/** Совпали бы со статическими разделами /admin/<...> */
const RESERVED_SLUGS = new Set(['slides', 'people', 'celebrations', 'screens', 'users', 'new']);

function isValidTimezone(tz: string) {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}

function serialize(s: { id: number; slug: string; name: string; timezone: string }): TScreen {
    return { id: s.id, slug: s.slug, name: s.name, timezone: s.timezone };
}

/** Публично: нужен для /tv/<slug> без логина. */
export async function findScreenBySlug(slug: string) {
    const screen = await prisma.screen.findUnique({ where: { slug } });
    if (!screen) throw new NotFoundError('Экран не найден');
    return screen;
}

export async function listScreensPublic(): Promise<TScreen[]> {
    const screens = await prisma.screen.findMany({ orderBy: { id: 'asc' } });
    return screens.map(serialize);
}

export async function listScreens(): Promise<TScreen[]> {
    await getCurrentUser();
    return listScreensPublic();
}

type ScreenInput = { slug?: unknown; name?: unknown; timezone?: unknown };

function validate(input: ScreenInput, partial: boolean) {
    const data: { slug?: string; name?: string; timezone?: string } = {};
    if (input.slug !== undefined || !partial) {
        const slug = String(input.slug ?? '').trim().toLowerCase();
        if (!SLUG_RE.test(slug)) throw new ValidationError('Slug: латиница в нижнем регистре, цифры и дефис, до 32 символов');
        if (RESERVED_SLUGS.has(slug)) throw new ValidationError(`Slug «${slug}» занят системным разделом`);
        data.slug = slug;
    }
    if (input.name !== undefined || !partial) {
        const name = String(input.name ?? '').trim();
        if (!name) throw new ValidationError('Укажите название экрана');
        data.name = name;
    }
    if (input.timezone !== undefined || !partial) {
        const timezone = String(input.timezone ?? 'UTC').trim();
        if (!isValidTimezone(timezone)) throw new ValidationError('Неизвестный часовой пояс');
        data.timezone = timezone;
    }
    return data;
}

export async function createScreen(input: ScreenInput) {
    await requireFullAdmin();
    const data = validate(input, false) as { slug: string; name: string; timezone: string };
    const exists = await prisma.screen.findUnique({ where: { slug: data.slug } });
    if (exists) throw new AppError('Экран с таким slug уже есть', 409);
    return serialize(await prisma.screen.create({ data }));
}

export async function updateScreen(id: number, input: ScreenInput) {
    await requireFullAdmin();
    const data = validate(input, true);
    if (data.slug) {
        const clash = await prisma.screen.findFirst({ where: { slug: data.slug, NOT: { id } } });
        if (clash) throw new AppError('Экран с таким slug уже есть', 409);
    }
    return serialize(await prisma.screen.update({ where: { id }, data }));
}

export async function deleteScreen(id: number) {
    await requireFullAdmin();
    await prisma.screen.delete({ where: { id } });
}
