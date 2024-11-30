import { UserDB } from '@/server/db'
import Auth from '@/server/utils/auth'
import { verify } from '@/server/utils/password'
import Session from '@/server/utils/session'
import type { UserSessionData } from '@/types/user'
import { convertToUserSessionData } from '@/types/user'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (context) => {
  const { request } = context

  // ヘッダチェック
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(
      JSON.stringify({
        message: 'Request format error'
      }),
      {
        status: 400
      }
    )
  }

  try {
    const body = await request.json()
    const email = body.email
    const password = body.password
    const rememberMe = body.rememberMe

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          message: 'Email address and password are required'
        }),
        {
          status: 400
        }
      )
    }

    // ユーザ情報取得
    const userWithPassword = await UserDB.getUserByEmail(email)
    if (!userWithPassword) {
      return new Response(
        JSON.stringify({
          message: 'Bad credentials'
        }),
        {
          status: 401
        }
      )
    }

    // ユーザ認証
    const verified = await verify(password, userWithPassword.password)
    if (!verified) {
      return new Response(
        JSON.stringify({
          message: 'Bad credentials'
        }),
        {
          status: 401
        }
      )
    }

    // セッション(ユーザ情報)作成
    const sessionData: UserSessionData = convertToUserSessionData(userWithPassword)
    await Session.createUser(context, sessionData)

    if (rememberMe) {
      // remember me トークン作成
      await Auth.createRememberMe(context, userWithPassword.id)
    }

    return new Response(
      JSON.stringify({
        message: 'Login succeeded'
      }),
      {
        status: 200
      }
    )
  } catch (err) {
    console.log(err)

    return new Response(
      JSON.stringify({
        message: 'Login failed'
      }),
      {
        status: 500
      }
    )
  }
}
