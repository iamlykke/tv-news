import 'server-only';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/dal/auth';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { assertUploaded, publicUrl, removeFiles } from '@/lib/storage';
import { dateToIsoDay, isoDayToDate } from '@/lib/dates';
import type { TPerson } from '@/types';

const include = { screen: { select: { slug: true, name: true } } } as const;

type PersonRow = {
    id: number;
    fullName: string;
    photoPath: string | null;
    dateOfBirth: Date | null;
    startDate: Date | null;
    isActive: boolean;
    screenId: number | null;
    screen: { slug: string; name: string } | null;
};

function serialize(p: PersonRow): TPerson {
    return {
        id: p.id,
        fullName: p.fullName,
        photoPath: p.photoPath,
        photoUrl: publicUrl(p.photoPath),
        dateOfBirth: dateToIsoDay(p.dateOfBirth),
        startDate: dateToIsoDay(p.startDate),
        isActive: p.isActive,
        screenId: p.screenId,
        screen: p.screen,
    };
}

type PersonInput = {
    fullName?: unknown;
    photoPath?: unknown;
    dateOfBirth?: unknown;
    startDate?: unknown;
    isActive?: unknown;
    screenId?: unknown;
};

function parseDay(value: unknown, field: string): Date | null {
    if (value === null || value === undefined || value === '') return null;
    const date = isoDayToDate(String(value));
    if (!date) throw new ValidationError(`${field}: ожидается дата yyyy-MM-dd`);
    return date;
}

async function parseScreenId(value: unknown): Promise<number | null> {
    if (value === null || value === undefined || value === '') return null;
    const id = Number(value);
    if (!Number.isInteger(id)) throw new ValidationError('Некорректный экран');
    const exists = await prisma.screen.findUnique({ where: { id } });
    if (!exists) throw new ValidationError('Экран не найден');
    return id;
}

export async function listPeople(): Promise<TPerson[]> {
    await getCurrentUser();
    const people = await prisma.person.findMany({ orderBy: { fullName: 'asc' }, include });
    return people.map(serialize);
}

export async function createPerson(input: PersonInput): Promise<TPerson> {
    await getCurrentUser();
    const fullName = String(input.fullName ?? '').trim();
    if (!fullName) throw new ValidationError('Укажите имя');

    const person = await prisma.person.create({
        data: {
            fullName,
            photoPath: input.photoPath ? await assertUploaded('person', input.photoPath) : null,
            dateOfBirth: parseDay(input.dateOfBirth, 'dateOfBirth'),
            startDate: parseDay(input.startDate, 'startDate'),
            isActive: input.isActive !== false,
            screenId: await parseScreenId(input.screenId),
        },
        include,
    });
    return serialize(person);
}

export async function updatePerson(id: number, input: PersonInput): Promise<TPerson> {
    await getCurrentUser();
    const current = await prisma.person.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Человек не найден');

    const data: Record<string, unknown> = {};
    if (input.fullName !== undefined) {
        const fullName = String(input.fullName).trim();
        if (!fullName) throw new ValidationError('Укажите имя');
        data.fullName = fullName;
    }
    let oldPhoto: string | null = null;
    if (input.photoPath !== undefined && input.photoPath !== current.photoPath) {
        data.photoPath = input.photoPath ? await assertUploaded('person', input.photoPath) : null;
        oldPhoto = current.photoPath;
    }
    if (input.dateOfBirth !== undefined) data.dateOfBirth = parseDay(input.dateOfBirth, 'dateOfBirth');
    if (input.startDate !== undefined) data.startDate = parseDay(input.startDate, 'startDate');
    if (input.isActive !== undefined) data.isActive = input.isActive === true;
    if (input.screenId !== undefined) data.screenId = await parseScreenId(input.screenId);

    const person = await prisma.person.update({ where: { id }, data, include });
    if (oldPhoto) await removeFiles([oldPhoto]);
    return serialize(person);
}

export async function deletePerson(id: number) {
    await getCurrentUser();
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) throw new NotFoundError('Человек не найден');
    await prisma.person.delete({ where: { id } });
    await removeFiles([person.photoPath]);
}
