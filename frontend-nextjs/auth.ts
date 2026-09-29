// NextAuth本体
import NextAuth from "next-auth"

// 認証設定を読み込む
import { authConfig } from "@/lib/nextauth"

// NextAuth初期化
export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth(authConfig)


