import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/wrappers/api';
import { listAllSlides } from '@/lib/dal/slides';

export const GET = apiHandler(async () => NextResponse.json(await listAllSlides()));
