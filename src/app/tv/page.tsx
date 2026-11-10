import Link from 'next/link';
import { listScreensPublic } from '@/lib/dal/screens';
import { FaTv } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export default async function TvHome() {
    const screens = await listScreensPublic();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
            <h1 className="font-display text-3xl font-bold">Choose a screen</h1>
            <div className="flex flex-wrap justify-center gap-4">
                {screens.map(screen => (
                    <Link key={screen.id} href={`/tv/${screen.slug}`} className="btn btn-neutral btn-lg gap-3 min-w-40">
                        <FaTv />
                        {screen.name}
                    </Link>
                ))}
                {screens.length === 0 && (
                    <p className="text-base-content/60">No screens yet — create one in the admin panel</p>
                )}
            </div>
        </div>
    );
}
