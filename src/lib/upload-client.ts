'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type UploadKind = 'slide' | 'person';

let client: SupabaseClient | null = null;

function getClient() {
    if (client) return client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY не заданы');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return client;
}

/**
 * Заливает файл напрямую в Supabase Storage по подписанной ссылке от нашего API.
 * Возвращает путь файла в бакете — его потом передаём в API при создании/обновлении записи.
 */
export async function uploadFile(kind: UploadKind, file: File): Promise<string> {
    const res = await fetch('/api/admin/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, contentType: file.type }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Ошибка ${res.status}`);

    const { path, token, bucket } = body as { path: string; token: string; bucket: string };
    const { error } = await getClient()
        .storage.from(bucket)
        .uploadToSignedUrl(path, token, file, { contentType: file.type, cacheControl: '31536000' });
    if (error) throw new Error(`Не удалось загрузить файл: ${error.message}`);

    return path;
}
