"use client"

import { SessionProvider } from "next-auth/react"

interface AuthProviderProps {
    children: React.ReactNode
}

// Sessionをアプリ全体で利用可能にする
const AuthProvider = ({
    children,
    }: AuthProviderProps) => {
    return (
        <SessionProvider>
        {children}
        </SessionProvider>
    )
    }

export default AuthProvider