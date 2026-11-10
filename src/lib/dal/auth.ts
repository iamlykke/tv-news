import 'server-only';

import { cache } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ForbiddenError, UnauthenticatedError } from '@/lib/errors';

export const getCurrentUser = cache(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new UnauthenticatedError();
    return session.user;
});

export const requireFullAdmin = async () => {
    const user = await getCurrentUser();
    if (user.role !== 'ROLE_FULL_ADMIN') throw new ForbiddenError('Insufficient permissions');
    return user;
};
