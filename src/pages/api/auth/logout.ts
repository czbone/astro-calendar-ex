import Auth from '@/server/utils/auth'
import Session from '@/server/utils/session'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (context) => {
  try {
    // セッション削除
    const userId = await Session.deleteUser(context)

    // 「remember me」トークン削除
    // ユーザIDが取得できない場合でもクッキーは削除する
    await Auth.removeRememberMe(context, userId)

    return new Response(
      JSON.stringify({
        message: 'Logout succeeded'
      }),
      {
        status: 200
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: 'Logout failed'
      }),
      {
        status: 500
      }
    )
  }
}
