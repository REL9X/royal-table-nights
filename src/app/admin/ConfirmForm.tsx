'use client'

import React from 'react'

interface ConfirmFormProps {
    children: React.ReactNode
    message?: string
    action?: (formData: FormData) => void
}

export default function ConfirmForm({ children, message = "Are you sure?", action }: ConfirmFormProps) {
    return (
        <form 
            action={action}
            onSubmit={(e) => {
                if (!window.confirm(message)) {
                    e.preventDefault()
                }
            }}
            style={{ display: 'contents' }}
        >
            {children}
        </form>
    )
}
