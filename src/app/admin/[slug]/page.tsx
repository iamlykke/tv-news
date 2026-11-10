import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaPlus, FaTv } from 'react-icons/fa';
import SlideList from '@/components/SlideList';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ScreenAdminPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const screen = await prisma.screen.findUnique({ where: { slug } });
    if (!screen) notFound();

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-wider text-base-content/50">
                        {screen.slug} · {screen.timezone}
                    </p>
                    <h1 className="text-2xl font-semibold font-display">{screen.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/tv/${screen.slug}`} target="_blank" className="btn btn-outline btn-sm gap-2">
                        <FaTv className="text-xs" /> Show on TV
                    </Link>
                    <Link href={`/admin/${screen.slug}/new`} className="btn btn-primary btn-sm gap-2">
                        <FaPlus className="text-xs" /> Add
                    </Link>
                </div>
            </div>
            <SlideList slug={screen.slug} />
        </div>
    );
}
