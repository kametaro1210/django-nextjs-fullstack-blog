import NextAuth, { type NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"

/**
 * Session型を拡張
 *
 * NextAuthのSession型にaccessTokenを追加する。
 *
 * 通常のSessionには accessToken が存在しないため、
 * session.accessToken でJWTを取得できるように拡張している。
 *
 * 利用例：
 * const session = await auth()
 * console.log(session.accessToken)
 */
declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

/**
 * JWT型を拡張
 *
 * JWT内にaccessTokenとrefreshTokenを保持できるようにする。
 *
 * NextAuthはJWTを内部で保持しているため、
 * Django(SimpleJWT)から取得したトークンを保存する。
 *
 * accessToken
 *   APIアクセス用トークン
 *
 * refreshToken
 *   accessToken期限切れ時に再発行するためのトークン
 */
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
  }
}

/**
 * ユーザー情報型
 *
 * Djangoの users/me APIから返却される
 * ユーザー情報の型定義。
 *
 * TypeScriptで補完が効くようになる。
 */
export interface UserType {
  accessToken: string
  uid: string
  name: string
  email: string
  avatar: string | undefined
  introduction: string
}

/**
 * Django API通信共通関数
 *
 * fetchを共通化している。
 *
 * 毎回
 * fetch(...)
 * response確認
 * json変換
 *
 * を書かなくて済む。
 *
 * API_URLは .env.local から取得。
 *
 * 利用例：
 * await fetchAPI("/api/auth/users/me/", {...})
 */
export const fetchAPI = async (
  url: string,
  options: RequestInit
) => {
  // Django APIのベースURL
  const apiUrl = process.env.API_URL

  // URL未設定の場合はエラー
  if (!apiUrl) {
    throw new Error("API URLが設定されていません")
  }

  // APIリクエスト送信
  const response = await fetch(
    `${apiUrl}${url}`,
    options
  )

  // ステータスコードが正常でない場合
  if (!response.ok) {
    throw new Error("APIでエラーが発生しました")
  }

  // JSONへ変換して返却
  return response.json()
}

/**
 * アクセストークン検証
 *
 * Django(SimpleJWT)の
 *
 * /jwt/verify/
 *
 * を利用して現在のアクセストークンが
 * まだ有効か確認する。
 *
 * 成功
 *   true
 *
 * 失敗
 *   false
 */
const verifyAccessToken = async (
  token: JWT
) => {
  try {
    await fetchAPI(
      "/api/auth/jwt/verify/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          token: token.accessToken,
        }),
      }
    )

    return true
  } catch {
    return false
  }
}

/**
 * アクセストークン更新
 *
 * accessTokenの有効期限が切れた場合、
 * refreshTokenを利用して
 * 新しいaccessTokenを取得する。
 *
 * Django(SimpleJWT)
 *
 * /jwt/refresh/
 *
 * を使用する。
 */
const refreshAccessToken = async (
  token: JWT
) => {
  const { access } = await fetchAPI(
    "/api/auth/jwt/refresh/",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        refresh: token.refreshToken,
      }),
    }
  )

  return {
    accessToken: access,
    refreshToken:
      token.refreshToken,
  }
}

/**
 * Djangoへログイン
 *
 * 処理の流れ
 *
 * メールアドレス
 * ↓
 * パスワード
 * ↓
 * jwt/create
 * ↓
 * accessToken取得
 * ↓
 * refreshToken取得
 * ↓
 * users/me
 * ↓
 * ユーザー情報取得
 *
 * ログイン成功時に
 * JWT情報とユーザー情報を返却する。
 */
const authorizeUser = async (
  email: string,
  password: string
) => {
  const session = await fetchAPI(
    "/api/auth/jwt/create/",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )

  const user = await fetchAPI(
    "/api/auth/users/me/",
    {
      method: "GET",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `JWT ${session.access}`,
      },
    }
  )

  return {
    ...session,
    user,
  }
}

/**
 * NextAuth設定
 *
 * アプリ全体の認証設定を管理する。
 *
 * 認証方法
 * セッション管理
 * JWT更新
 * セッション生成
 *
 * などを定義する。
 */
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({

      /**
       * Credentials認証
       *
       * Googleログインなどではなく、
       * メールアドレスとパスワードでログインする。
       */
      name: "credentials",

      credentials: {

        /**
         * ログインフォームのメールアドレス欄
         */
        email: {
          label: "email",
          type: "text",
        },

        /**
         * ログインフォームのパスワード欄
         */
        password: {
          label: "password",
          type: "password",
        },
      },

      /**
       * ログイン時に実行される。
       *
       * 入力されたメールアドレスとパスワードを
       * Djangoへ送信してログイン認証を行う。
       */
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          throw new Error(
            "メールアドレスとパスワードを入力してください"
          )
        }

        return authorizeUser(
          credentials.email as string,
          credentials.password as string
        )
      },
    }),
  ],

  /**
   * セッション管理方式
   *
   * JWT方式を使用。
   *
   * DBへ保存せず、
   * JWT内で認証状態を管理する。
   */
  session: {
    strategy: "jwt",
  },

  /**
   * JWT暗号化用シークレットキー
   *
   * .env.local の
   * NEXTAUTH_SECRET を利用。
   */
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {

    /**
     * JWTコールバック
     *
     * ログイン時
     * ページ更新時
     * セッション取得時
     *
     * などに呼ばれる。
     */
    async jwt({ token, user }) {

      /**
       * 初回ログイン時
       *
       * Djangoから取得した
       * accessToken
       * refreshToken
       *
       * をJWTへ保存。
       */
      if (user) {
        token.accessToken =
          (user as any).access

        token.refreshToken =
          (user as any).refresh
      }

      /**
       * accessToken有効
       *
       * そのままJWTを返却。
       */
      if (
        token.accessToken &&
        await verifyAccessToken(token)
      ) {
        return token
      }

      /**
       * accessToken期限切れ
       *
       * refreshTokenを利用して
       * 新しいaccessTokenを取得。
       */
      return {
        ...token,
        ...(await refreshAccessToken(
          token
        )),
      }
    },

    /**
     * Sessionコールバック
     *
     * JWTの情報をSessionへ渡す。
     *
     * session.accessToken
     *
     * として利用できるようになる。
     */
    async session({
      session,
      token,
    }) {
      session.accessToken =
        token.accessToken

      return session
    },
  },
}

/**
 * NextAuth ヘルパー関数と設定の初期化
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

/**
 * 認証情報取得（サーバーサイド用）
 */
/**
 * 認証情報取得（サーバーサイド用）
 */
export const getAuthSession = async (): Promise<UserType | null> => {
    const session = await auth()

    if (!session || !session.accessToken) {
        return null
    }

    // NextAuthのsessionからDjangoのユーザー情報(UserType)を取り出して返却
    return (session.user as UserType) || null
}
