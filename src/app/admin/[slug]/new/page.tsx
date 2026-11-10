import Link from 'next/link';
import { notFound } from 'next/navigation';
import SlideForm from '@/components/SlideForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NewSlidePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const screen = await prisma.screen.findUnique({ where: { slug } });
    if (!screen) notFound();

    return (
        <div>
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold">Новый слайд · {screen.name}</h1>
                <Link href={`/admin/${slug}`} className="btn btn-ghost btn-sm">
                    ← К слайдам
                </Link>
            </div>
            <SlideForm slug={slug} />
        </div>
    );
}
