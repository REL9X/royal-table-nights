import React from 'react'
import Link from 'next/link'

interface PlayerNameProps {
    user: {
        id?: string
        name?: string
        role?: string
    } | null | undefined
    className?: string
    isClickable?: boolean
}

export default function PlayerName({ user, className = "", isClickable = false }: PlayerNameProps) {
    if (!user || (!user.name && user.name !== '')) {
        return <span className={className}>-</span>
    }

    const { id, name, role } = user

    // Remove "GM " prefix if the user manually added it, so we don't duplicate it.
    let baseName = name
    if (baseName?.startsWith('GM ')) {
        baseName = baseName.substring(3).trim()
    }

    const content = role === 'admin' ? (
        <>
            <span className="text-sky-400">GM</span> {baseName}
        </>
    ) : (
        <>{baseName}</>
    )

    if (isClickable && id) {
        return (
            <Link href={`/player/${id}`} className={`hover:underline cursor-pointer ${className}`}>
                {content}
            </Link>
        )
    }

    return <span className={className}>{content}</span>
}
