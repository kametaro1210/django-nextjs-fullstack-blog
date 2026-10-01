import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/nextauth"
import Signup from "@/components/auth/Signup"

// App Routerのページは既定でServer Componentなので、サーバー上で認証状態を確認できます。
const SignupPage = async () => {
  // ログイン済みかどうかをサーバー側で確認します。
  const user = await getAuthSession()

  // ログイン済みのユーザーには、新規登録画面ではなくトップページを表示します。
  if (user) {
    redirect("/")
  }

  // 未ログインの場合だけ、クライアント側で操作する登録フォームを表示します。
  return <Signup />
}

export default SignupPage