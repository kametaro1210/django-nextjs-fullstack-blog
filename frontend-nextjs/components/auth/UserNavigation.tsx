"use client"

// UIライブラリ（Radix UI / shadcn/ui）からドロップダウンメニュー用パーツを読み込み
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// クライアント側でサインアウト（ログアウト）を行うためのNextAuth関数
import { signOut } from "next-auth/react"

// 型定義の取得
import { UserType } from "@/lib/nextauth"
import Link from "next/link"
import Image from "next/image"

// 外部から渡される props の型定義
interface UserNavigationProps {
  user: UserType
}

/**
 * ログイン済みユーザー向けナビゲーションコンポーネント
 * 
 * アイコン画像をクリックするとドロップダウンメニューが開き、
 * プロフィール・新規投稿・アカウント設定・ログアウトなどの操作ができます。
 */
const UserNavigation = ({ user }: UserNavigationProps) => {
  return (
    <DropdownMenu>
      {/* 1. トリガー（ボタンとなる部分：ユーザーのプロフィールアイコン画像） */}
      <DropdownMenuTrigger>
        <div className="relative w-10 h-10 flex-shrink-0">
          {/* 画像未設定時はデフォルト画像を表示 */}
          <Image
            src={user.avatar || "/default.png"}
            className="rounded-full object-cover"
            alt={user.name || "avatar"}
            fill
          />
        </div>
      </DropdownMenuTrigger>

      {/* 2. ドロップダウンメニューの中身（右寄せで幅300px） */}
      <DropdownMenuContent className="bg-white p-2 w-[300px]" align="end">
        {/* ユーザー情報表示領域（クリックで自分のプロフィールページへ移動） */}
        <Link href={`/user/${user.uid}`}>
          <DropdownMenuItem className="cursor-pointer">
            <div className="break-words">
              <div className="mb-2">{user.name || ""}</div>
              <div className="text-gray-500">{user.email || ""}</div>
            </div>
          </DropdownMenuItem>
        </Link>

        {/* 区切り線 */}
        <DropdownMenuSeparator />

        {/* 各種機能への遷移リンク */}
        <Link href="/post/new">
          <DropdownMenuItem className="cursor-pointer">
            新規投稿
          </DropdownMenuItem>
        </Link>

        <Link href="/settings/profile">
          <DropdownMenuItem className="cursor-pointer">
            アカウント設定
          </DropdownMenuItem>
        </Link>

        {/* ログアウトボタン（クリック時にセッションを破棄し、トップページへ遷移） */}
        <DropdownMenuItem
          onSelect={async () => {
            await signOut({ callbackUrl: "/" })
          }}
          className="text-red-600 cursor-pointer"
        >
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserNavigation