'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

const ERRORS: Record<string, string> = {
    AccessDenied: 'У этого аккаунта нет доступа. Попросите администратора добавить ваш email.',
    OAuthAccountNotLinked: 'Этот Google-аккаунт уже связан с другим способом входа',
};

export default function LoginPageInner() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useSearchParams();
    const error = params.get('error');
    const callbackUrl = params.get('callbackUrl') || '/admin';
    const errorMessage = error ? (ERRORS[error] ?? 'Ошибка авторизации') : null;

    useEffect(() => {
        if (session?.user?.id) router.replace(callbackUrl);
    }, [session, router, callbackUrl]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
            <div className="card bg-base-100 border border-base-300 w-full max-w-sm">
                <div className="card-body items-center text-center gap-5">
                    <img src="/icon.png" alt="" className="w-20 h-20 rounded-2xl" />
                    <div>
                        <h1 className="font-display text-2xl font-bold">TV Slides</h1>
                        <p className="text-sm text-base-content/60 mt-1">Управление слайдами на офисных экранах</p>
                    </div>
                    <button className="btn btn-outline w-full gap-2" onClick={() => signIn('google', { callbackUrl })}>
                        <FcGoogle className="text-xl" /> Войти через Google
                    </button>
                    {errorMessage && <p className="text-error text-sm">{errorMessage}</p>}
                </div>
            </div>
        </div>
    );
}
