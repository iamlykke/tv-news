import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, readJson } from '@/lib/wrappers/api';
import { getCurrentUser } from '@/lib/dal/auth';
import { createUploadTarget, UPLOAD_KINDS, UploadKind } from '@/lib/storage';
import { ValidationError } from '@/lib/errors';

/** Выдаёт подписанную ссылку для прямой загрузки файла в Supabase Storage. */
export const POST = apiHandler(async (req: NextRequest) => {
    await getCurrentUser();
    const { kind, contentType } = await readJson<{ kind?: string; contentType?: string }>(req);
    if (!kind || !(kind in UPLOAD_KINDS)) throw new ValidationError('Неизвестный тип загрузки');
    return NextResponse.json(await createUploadTarget(kind as UploadKind, String(contentType ?? '')));
});
