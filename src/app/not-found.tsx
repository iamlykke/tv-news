import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 dark:bg-zinc-950">
            <h1 className="text-9xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">404</h1>

            <div className="mt-4 h-1 w-16 rounded-full bg-black" />
            <h2 className="mt-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-200">Страница не найдена</h2>
            <p className="mt-3 max-w-md text-center text-zinc-500 dark:text-zinc-400">
                К сожалению, запрашиваемая страница не существует.
            </p>
            <div className="mt-8">
                <Link href="/" className="btn btn-neutral w-70">
                    На главную
                </Link>
            </div>
        </div>
    );
}
