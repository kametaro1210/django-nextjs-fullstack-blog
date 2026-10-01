// このファイル内の関数をサーバー上で実行するServer Actionとして定義します。
"use server"

// 仮登録APIへ送るために必要な入力値をまとめた型です。
interface TemporarySignupInput {
  name: string
  email: string
  password: string
  rePassword: string
}

// Djangoの仮登録APIを呼び出し、処理が成功したかどうかを返します。
export const temporarySignup = async ({
  name,
  email,
  password,
  rePassword,
}: TemporarySignupInput): Promise<{ success: boolean }> => {
  try {
    // フロントエンドのrePasswordを、Django APIが受け取るre_passwordに変換します。
    const body = JSON.stringify({
      name,
      email,
      password,
      re_password: rePassword,
    })

    // アカウント仮登録を送信
    const apiRes = await fetch(`${process.env.API_URL}/api/auth/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })

    // APIがエラーのHTTPステータスを返した場合は、失敗として画面に伝えます。
    if (!apiRes.ok) {
      return {
        success: false,
      }
    }

    // APIが成功した場合は、画面側で完了メッセージを表示できるようにします。
    return {
      success: true,
    }
  } catch (error) {
    // 通信エラーなどでfetch自体が失敗した場合も、画面側で扱える形にします。
    console.error("仮登録APIの呼び出しに失敗しました", error)
    return {
      success: false,
    }
  }
}