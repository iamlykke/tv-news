import Link from 'next/link';
import { FaCog, FaTv } from 'react-icons/fa';
import { listScreens } from '@/lib/dal/screens';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
    const screens = await listScreens();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Screens</h1>

            {screens.length === 0 ? (
                <div className="text-center py-20 text-base-content/50">
                    <p>No screens yet.</p>
                    <Link href="/admin/screens" className="btn btn-primary btn-sm mt-4">
                        Create screen
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {screens.map(screen => (
                        <div key={screen.id} className="card bg-base-100 border border-base-300">
                            <div className="card-body gap-1">
                                <span className="text-xs uppercase tracking-wider text-base-content/50">
                                    {screen.slug}
                                </span>
                                <h2 className="card-title font-display">{screen.name}</h2>
                                <p className="text-xs text-base-content/60">{screen.timezone}</p>
                                <div className="card-actions mt-3">
                                    <Link href={`/admin/${screen.slug}`} className="btn btn-sm btn-primary gap-2">
                                        <FaCog /> Slides
                                    </Link>
                                    <Link
                                        href={`/tv/${screen.slug}`}
                                        target="_blank"
                                        className="btn btn-sm btn-outline gap-2"
                                    >
                                        <FaTv /> Show on TV
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
