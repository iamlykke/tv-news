'use client';

/** fetch + JSON + понятная ошибка из тела ответа `{ error }`. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
    const { json, ...rest } = init ?? {};
    const res = await fetch(url, {
        ...rest,
        headers: json !== undefined ? { 'Content-Type': 'application/json', ...rest.headers } : rest.headers,
        body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error || `Ошибка ${res.status}`);
    return body as T;
}

export function errorMessage(e: unknown) {
    return e instanceof Error ? e.message : String(e);
}

/** ISO → значение для <input type="datetime-local"> в часовом поясе браузера. */
export function isoToLocalInput(iso: string | null | undefined) {
    if (!iso) return '';
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** Значение datetime-local (локальное время браузера) → ISO для API. */
export function localInputToIso(value: string | null | undefined) {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDay(isoDay: string | null) {
    if (!isoDay) return '—';
    return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

export function todayLocalIsoDay() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
