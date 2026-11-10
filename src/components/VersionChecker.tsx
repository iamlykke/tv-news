'use client';

import { useEffect, useRef } from 'react';

export function VersionChecker() {
    const initialBuildRef = useRef<string | null>(null);

    useEffect(() => {
        const check = async () => {
            try {
                const current = initialBuildRef.current;
                const params = new URLSearchParams();
                if (current) {
                    params.set('current', current);
                    params.set('path', window.location.pathname);
                }
                const query = params.toString();
                const res = await fetch(`/api/version${query ? `?${query}` : ''}`, { cache: 'no-store' });
                if (!res.ok) return;
                const { buildId } = await res.json();

                if (initialBuildRef.current === null) {
                    initialBuildRef.current = buildId;
                } else if (initialBuildRef.current !== buildId) {
                    window.location.reload();
                }
            } catch {}
        };

        check();
        const id = setInterval(check, 10 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    return null;
}
