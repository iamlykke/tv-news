import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/wrappers/api';
import { getCurrentUser } from '@/lib/dal/auth';

export const GET = apiHandler(async () => NextResponse.json(await getCurrentUser()));
