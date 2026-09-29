"use client"

import { Button } from "@/components/ui/button"
import { UserType } from "@/lib/nextauth"
import UserNavigation from "./UserNavigation"
import Link from "next/link"
interface NavigationProps {
  user: UserType | null
}

// ナビゲーション
const Navigation = ({ user }: NavigationProps) => {
  return (
    <header className="shadow-lg shadow-gray-100 mb-10">
      <div className="container mx-auto flex max-w-screen-md items-center justify-between px-2 py-3">
        <Link href="/" className="cursor-pointer text-xl font-bold">
          Next.js+DRF入門
        </Link>

        {/* user（ユーザー情報）が存在するかどうかで表示を切り替える条件分岐 */}
        
        {user ? (
          /* 1. ログイン済み（userが存在する）場合 */
          <div>
            {/* ログインユーザー用のナビゲーションメニュー（アバター画像やログアウトボタンなど）を表示 */}
            <UserNavigation user={user} />
          </div>
        ) : (
          /* 2. 未ログイン（userがnullまたは存在しない）場合 */
          <div className="flex items-center space-x-1">
            {/* ログインページへの遷移ボタン */}
            <Button asChild variant="ghost" className="font-bold">
              <Link href="/login">ログイン</Link>
            </Button>
            {/* 新規登録ページへの遷移ボタン */}
            <Button asChild variant="default" className="font-bold">
              <Link href="/signup">新規登録</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navigation