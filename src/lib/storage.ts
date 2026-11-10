import 'server-only';
import { randomUUID } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/lib/errors';

export const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'slides';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (client) return client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new AppError('Supabase Storage не настроен (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return client;
}

export function publicUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

export const UPLOAD_KINDS = {
    slide: {
        prefix: 'slides',
        types: {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/avif': 'avif',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
        },
    },
    person: {
        prefix: 'people',
        types: {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
        },
    },
} as const satisfies Record<string, { prefix: string; types: Record<string, string> }>;

export type UploadKind = keyof typeof UPLOAD_KINDS;

/**
 * Создаёт подписанную ссылку, по которой браузер заливает файл напрямую в Supabase.
 * Так файл не проходит через serverless-функцию Vercel (у неё лимит тела запроса ~4.5 МБ).
 */
export async function createUploadTarget(kind: UploadKind, contentType: string) {
    const config = UPLOAD_KINDS[kind];
    const ext = (config.types as Record<string, string>)[contentType];
    if (!ext) throw new AppError(`Тип файла ${contentType || 'unknown'} не поддерживается`, 400);

    const path = `${config.prefix}/${randomUUID()}.${ext}`;
    const { data, error } = await getClient().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new AppError(`Не удалось подготовить загрузку: ${error?.message}`, 502);

    return { path, token: data.token, bucket: BUCKET };
}

/** Проверяет, что путь создан нашим upload-эндпоинтом для нужного типа и файл действительно залит. */
export async function assertUploaded(kind: UploadKind, path: unknown): Promise<string> {
    const prefix = UPLOAD_KINDS[kind].prefix;
    if (typeof path !== 'string' || !new RegExp(`^${prefix}/[0-9a-f-]{36}\\.[a-z0-9]+$`).test(path)) {
        throw new AppError('Некорректный путь файла', 400);
    }
    const { data, error } = await getClient().storage.from(BUCKET).exists(path);
    if (error || !data) throw new AppError('Файл не найден в хранилище — загрузите его ещё раз', 400);
    return path;
}

export async function removeFiles(paths: Array<string | null | undefined>) {
    const list = paths.filter((p): p is string => !!p);
    if (list.length === 0) return;
    const { error } = await getClient().storage.from(BUCKET).remove(list);
    if (error) console.error('[storage] remove failed', list, error);
}
