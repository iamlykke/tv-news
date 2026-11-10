import 'server-only';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/dal/auth';
import { DayParts, formatDayMonth, isSameCalendarDay } from '@/lib/dates';
import { publicUrl } from '@/lib/storage';
import type { TCelebrations } from '@/types';

/**
 * Дни рождения и годовщины на дату.
 * screenId: число — люди этого экрана + люди «на всех экранах»; undefined — все активные люди.
 */
export async function findCelebrations(target: DayParts, screenId?: number): Promise<TCelebrations> {
    const people = await prisma.person.findMany({
        where: {
            isActive: true,
            ...(screenId !== undefined ? { OR: [{ screenId: null }, { screenId }] } : {}),
        },
        orderBy: { fullName: 'asc' },
    });

    const birthdays = people
        .filter(p => p.dateOfBirth && isSameCalendarDay(p.dateOfBirth, target))
        .map(p => ({
            personId: p.id,
            fullName: p.fullName,
            photoUrl: publicUrl(p.photoPath),
            dateLabel: formatDayMonth(p.dateOfBirth!),
        }));

    const anniversaries = people
        .filter(p => p.startDate && isSameCalendarDay(p.startDate, target))
        .map(p => ({
            personId: p.id,
            fullName: p.fullName,
            photoUrl: publicUrl(p.photoPath),
            years: target.year - p.startDate!.getUTCFullYear(),
        }))
        .filter(a => a.years > 0);

    return { birthdays, anniversaries };
}

export async function getCelebrations(target: DayParts, screenId?: number) {
    await getCurrentUser();
    return findCelebrations(target, screenId);
}
