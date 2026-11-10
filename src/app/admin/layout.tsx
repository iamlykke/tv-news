import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaBirthdayCake, FaDesktop, FaImages, FaTv, FaUserShield, FaUsers } from 'react-icons/fa';
import LogoutButton from '@/components/LogoutBtn';
import UserProfile from '@/components/UserProfile';
import { getCurrentUser } from '@/lib/dal/auth';
import { listScreens } from '@/lib/dal/screens';
import { UnauthenticatedError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

function NavLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="gap-3">
                {icon}
                {children}
            </Link>
        </li>
    );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    let user;
    try {
        user = await getCurrentUser();
    } catch (e) {
        if (e instanceof UnauthenticatedError) redirect('/login');
        throw e;
    }
    const screens = await listScreens();

    return (
        <div className="flex min-h-screen">
            <aside className="w-72 shrink-0 h-screen border-r border-base-300 p-5 flex flex-col sticky top-0 bg-base-100">
                <Link href="/admin" className="flex items-center gap-3 px-2 mb-6">
                    <img src="/logo.svg" alt="" className="w-9 h-9" />
                    <span className="font-display text-lg font-bold">TV Slides</span>
                </Link>

                <nav className="flex-1 overflow-y-auto">
                    <p className="px-3 mb-1 text-xs uppercase tracking-wider text-base-content/50">Screens</p>
                    <ul className="menu w-full p-0 mb-4">
                        {screens.map(screen => (
                            <NavLink key={screen.id} href={`/admin/${screen.slug}`} icon={<FaTv />}>
                                {screen.name}
                            </NavLink>
                        ))}
                        {screens.length === 0 && <li className="px-3 text-sm text-base-content/50">Nothing yet</li>}
                    </ul>

                    <p className="px-3 mb-1 text-xs uppercase tracking-wider text-base-content/50">Manage</p>
                    <ul className="menu w-full p-0">
                        <NavLink href="/admin/slides" icon={<FaImages />}>
                            All slides
                        </NavLink>
                        <NavLink href="/admin/people" icon={<FaUsers />}>
                            People
                        </NavLink>
                        <NavLink href="/admin/celebrations" icon={<FaBirthdayCake />}>
                            Celebrations
                        </NavLink>
                        <NavLink href="/admin/screens" icon={<FaDesktop />}>
                            Screens
                        </NavLink>
                        <NavLink href="/admin/users" icon={<FaUserShield />}>
                            Admins
                        </NavLink>
                    </ul>
                </nav>

                <div className="flex flex-col gap-3 pt-4">
                    <UserProfile user={user} />
                    <LogoutButton />
                </div>
            </aside>

            <main className="flex-1 min-w-0 p-8">
                <div className="mx-auto max-w-[1320px]">{children}</div>
            </main>
        </div>
    );
}
