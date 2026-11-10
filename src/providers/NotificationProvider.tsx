'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import NotificationContainer, { type INotification } from '@/components/Notification';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotifyOptions {
    duration?: number;
}

interface INotificationContext {
    notify: {
        info: (message: string, options?: NotifyOptions) => void;
        success: (message: string, options?: NotifyOptions) => void;
        warning: (message: string, options?: NotifyOptions) => void;
        error: (message: string, options?: NotifyOptions) => void;
    };
}

const NotificationContext = createContext<INotificationContext | null>(null);

const DEFAULT_DURATION = 5000;

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<INotification[]>([]);

    const addNotification = useCallback(
        (message: string, type: NotificationType = 'info', duration: number = DEFAULT_DURATION) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            setNotifications(prev => [...prev, { id, message, type, duration }]);
        },
        [],
    );

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Стабильная ссылка — можно класть notify в зависимости хуков
    const value = useMemo(
        () => ({
            notify: {
                info: (message: string, options?: NotifyOptions) => addNotification(message, 'info', options?.duration),
                success: (message: string, options?: NotifyOptions) =>
                    addNotification(message, 'success', options?.duration),
                warning: (message: string, options?: NotifyOptions) =>
                    addNotification(message, 'warning', options?.duration),
                error: (message: string, options?: NotifyOptions) =>
                    addNotification(message, 'error', options?.duration),
            },
        }),
        [addNotification],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
}

export function useNotify() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotify must be used within NotificationProvider');
    }
    return context.notify;
}
