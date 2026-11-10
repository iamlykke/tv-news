import type { TSessionUser } from '@/next-auth';
import { initials } from '@/components/slides/decor';

const ROLE_LABELS = { ROLE_ADMIN: 'Admin', ROLE_FULL_ADMIN: 'Full Admin' } as const;

export default function UserProfile({ user }: { user: TSessionUser }) {
    return (
        <div className="flex items-center gap-3 bg-base-200 rounded-box p-3 w-full">
            <div className="avatar">
                <div className="w-10 rounded-full overflow-hidden bg-neutral text-neutral-content">
                    {user.image ? (
                        <img src={user.image} alt="" referrerPolicy="no-referrer" />
                    ) : (
                        <span className="flex w-full h-full items-center justify-center text-sm">
                            {initials(user.name || user.email || '?')}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">{user.name || user.email}</span>
                <span className="text-xs text-base-content/60 truncate">{ROLE_LABELS[user.role]}</span>
            </div>
        </div>
    );
}
