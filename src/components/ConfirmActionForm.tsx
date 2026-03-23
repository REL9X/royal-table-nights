'use client'

import React, { useState } from 'react'

export default function ConfirmActionForm({
    action,
    confirmMessage,
    className = "contents",
    children
}: {
    action: (formData: FormData) => Promise<void>;
    confirmMessage: string;
    className?: string;
    children: React.ReactNode;
}) {
    const [isPending, setIsPending] = useState(false)

    return (
        <form
            action={async (formData) => {
                if (window.confirm(confirmMessage)) {
                    setIsPending(true)
                    try {
                        await action(formData)
                    } catch (e) {
                        console.error("Action error:", e)
                        setIsPending(false)
                    }
                }
            }}
            className={className}
        >
            <div className={isPending ? 'opacity-50 pointer-events-none' : ''}>
                {children}
            </div>
        </form>
    )
}
