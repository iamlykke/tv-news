/**
 * Даты рождения и начала работы хранятся как Postgres DATE — Prisma отдаёт их как полночь UTC.
 * Поэтому сравниваем только UTC-компоненты, а «сегодня» считаем в часовом поясе экрана.
 */

export type DayParts = { year: number; month: number; day: number };

/** Сегодняшняя дата в указанном IANA-часовом поясе. */
export function todayIn(timezone: string, now: Date = new Date()): DayParts {
    let iso: string;
    try {
        iso = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(now);
    } catch {
        iso = now.toISOString().slice(0, 10);
    }
    return parseIsoDay(iso)!;
}

/** "yyyy-MM-dd" → части даты, либо null если строка невалидна. */
export function parseIsoDay(value: string): DayParts | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const check = new Date(Date.UTC(year, month - 1, day));
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
    return { year, month, day };
}

export function toIsoDay({ year, month, day }: DayParts): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** "yyyy-MM-dd" → Date (полночь UTC), для записи в колонку DATE. */
export function isoDayToDate(value: string): Date | null {
    const parts = parseIsoDay(value);
    return parts ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day)) : null;
}

export function dateToIsoDay(date: Date | null): string | null {
    return date ? date.toISOString().slice(0, 10) : null;
}

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Совпадает ли день/месяц даты с целевым днём.
 * Родившиеся 29 февраля в невисокосный год празднуют 1 марта.
 */
export function isSameCalendarDay(date: Date, target: DayParts): boolean {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    if (month === target.month && day === target.day) return true;
    return month === 2 && day === 29 && target.month === 3 && target.day === 1 && !isLeapYear(target.year);
}

export function formatDayMonth(date: Date, locale = 'en-GB'): string {
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
}
