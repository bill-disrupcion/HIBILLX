import React from 'react';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
