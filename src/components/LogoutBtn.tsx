'use client';
import { signOut } from 'next-auth/react';
import { FiLogOut } from 'react-icons/fi';

export default function LogoutButton() {
    return (
        <button
            className="btn btn-soft btn-error w-full flex flex-row items-center gap-2"
            onClick={() => signOut({ callbackUrl: '/login' })}
        >
            <FiLogOut /> Sign out
        </button>
    );
}
