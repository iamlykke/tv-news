import { Suspense } from 'react';
import LoginPageInner from '@/components/LoginPageInner';

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageInner />
        </Suspense>
    );
}
