import type { APIRoute } from 'astro'
import Session from '@/server/utils/session'

export const POST: APIRoute = async (context) => {
  try {
    // セッション削除
    await Session.deleteUser(context)

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
