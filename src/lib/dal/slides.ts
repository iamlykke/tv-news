import 'server-only';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/dal/auth';
import { findScreenBySlug } from '@/lib/dal/screens';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { assertUploaded, publicUrl, removeFiles } from '@/lib/storage';
import { getSlideStatus, isVideoPath } from '@/lib/slide-status';
import type { TSlide } from '@/types';

type SlideRow = {
    id: number;
    storagePath: string;
    isHidden: boolean;
    isDeleted: boolean;
    showAfter: Date | null;
    deleteAfter: Date | null;
    createdAt: Date;
    screen: { slug: string; name: string };
};

const withScreen = { screen: { select: { slug: true, name: true } } } as const;

function serialize(s: SlideRow, now = new Date()): TSlide {
    return {
        id: s.id,
        url: publicUrl(s.storagePath)!,
        storagePath: s.storagePath,
        isVideo: isVideoPath(s.storagePath),
        isHidden: s.isHidden,
        isDeleted: s.isDeleted,
        showAfter: s.showAfter?.toISOString() ?? null,
        deleteAfter: s.deleteAfter?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
        status: getSlideStatus(s, now),
        screen: s.screen,
    };
}

function parseDateTime(value: unknown, field: string): Date | null {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(String(value));
    if (isNaN(date.getTime())) throw new ValidationError(`${field}: invalid date`);
    return date;
}

type SlideInput = {
    storagePath?: unknown;
    showAfter?: unknown;
    deleteAfter?: unknown;
    isHidden?: unknown;
};

/** Публично: что сейчас должно крутиться на экране. Расписание считается прямо в запросе — крон не нужен. */
export async function listLiveSlides(screenId: number): Promise<TSlide[]> {
    const now = new Date();
    const slides = await prisma.slide.findMany({
        where: {
            screenId,
            isDeleted: false,
            isHidden: false,
            AND: [
                { OR: [{ showAfter: null }, { showAfter: { lte: now } }] },
                { OR: [{ deleteAfter: null }, { deleteAfter: { gt: now } }] },
            ],
        },
        orderBy: { createdAt: 'desc' },
        include: withScreen,
    });
    return slides.map(s => serialize(s, now));
}

export async function listScreenSlides(screenId: number): Promise<TSlide[]> {
    await getCurrentUser();
    const slides = await prisma.slide.findMany({
        where: { screenId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        include: withScreen,
    });
    return slides.map(s => serialize(s));
}

export async function listAllSlides(): Promise<TSlide[]> {
    await getCurrentUser();
    const slides = await prisma.slide.findMany({ orderBy: { createdAt: 'desc' }, include: withScreen });
    return slides.map(s => serialize(s));
}

export async function getSlide(id: number): Promise<TSlide> {
    await getCurrentUser();
    const slide = await prisma.slide.findUnique({ where: { id }, include: withScreen });
    if (!slide) throw new NotFoundError('Slide not found');
    return serialize(slide);
}

export async function createSlide(slug: string, input: SlideInput): Promise<TSlide> {
    await getCurrentUser();
    const screen = await findScreenBySlug(slug);
    const storagePath = await assertUploaded('slide', input.storagePath);

    const slide = await prisma.slide.create({
        data: {
            screenId: screen.id,
            storagePath,
            showAfter: parseDateTime(input.showAfter, 'showAfter'),
            deleteAfter: parseDateTime(input.deleteAfter, 'deleteAfter'),
            isHidden: input.isHidden === true,
        },
        include: withScreen,
    });
    return serialize(slide);
}

export async function updateSlide(id: number, input: SlideInput): Promise<TSlide> {
    await getCurrentUser();
    const current = await prisma.slide.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Slide not found');

    const data: { storagePath?: string; showAfter?: Date | null; deleteAfter?: Date | null; isHidden?: boolean } = {};
    if (input.storagePath !== undefined && input.storagePath !== current.storagePath) {
        data.storagePath = await assertUploaded('slide', input.storagePath);
    }
    if (input.showAfter !== undefined) data.showAfter = parseDateTime(input.showAfter, 'showAfter');
    if (input.deleteAfter !== undefined) data.deleteAfter = parseDateTime(input.deleteAfter, 'deleteAfter');
    if (input.isHidden !== undefined) data.isHidden = input.isHidden === true;

    const slide = await prisma.slide.update({ where: { id }, data, include: withScreen });
    if (data.storagePath) await removeFiles([current.storagePath]);
    return serialize(slide);
}

/** Мягкое удаление: слайд пропадает с экрана, но остаётся в истории «Все слайды». */
export async function softDeleteSlide(id: number) {
    await getCurrentUser();
    const slide = await prisma.slide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundError('Slide not found');
    await prisma.slide.update({ where: { id }, data: { isDeleted: true } });
}
