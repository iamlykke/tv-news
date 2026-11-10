import React from 'react';
import type { Metadata } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import { ClientSessionProvider } from '@/components/ClientSessionProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { VersionChecker } from '@/components/VersionChecker';
import '../styles/globals.css';

const display = Unbounded({
    subsets: ['latin', 'latin-ext', 'cyrillic'],
    weight: ['500', '700', '900'],
    variable: '--font-unbounded',
});

const text = Manrope({
    subsets: ['latin', 'latin-ext', 'cyrillic'],
    variable: '--font-manrope',
});

export const metadata: Metadata = {
    title: 'TV Slides',
    description: 'Слайды для офисных экранов',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru" data-theme="light">
            <body className={`${display.variable} ${text.variable} font-text antialiased`} suppressHydrationWarning>
                <VersionChecker />
                <ClientSessionProvider>
                    <NotificationProvider>{children}</NotificationProvider>
                </ClientSessionProvider>
            </body>
        </html>
    );
}
