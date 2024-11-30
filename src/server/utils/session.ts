import config from '@/server/config'
import type { UserSessionData } from '@/types/user'
import type { APIContext } from 'astro'
import cookieSignature from 'cookie-signature'
import { v4 as uuidv4 } from 'uuid'

class Session {
  // セッション情報(ユーザ情報)を取得
  async getUser(context: APIContext): Promise<UserSessionData | null> {
    // クッキー取得
    const cookie = context.cookies.get(config.SESSION_COOKIE_NAME)?.value
    if (!cookie) return null

    // セッションID取得
    const unsignedSession = _unsign(cookie, config.SESSION_COOKIE_SECRET)
    if (!unsignedSession) return null

    // セッション情報取得
    const result = await context.locals.session.get(config.SESSION_ID_PREFIX + unsignedSession)
    if (result) {
      // セッションクッキーの有効期限更新
      context.cookies.set(config.SESSION_COOKIE_NAME, cookie, {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: import.meta.env.PROD,
        maxAge: config.SESSION_EXPIRES
      })

      // セッション情報の有効期限更新
      await context.locals.session.touch(config.SESSION_ID_PREFIX + unsignedSession)

      return result.user
    } else {
      return null
    }
  }
  async createUser(context: APIContext, user: UserSessionData): Promise<UserSessionData | null> {
    // セッションID作成
    const sessionId = uuidv4()
    const signedSessionId = _sign(sessionId, config.SESSION_COOKIE_SECRET)

    // クッキー作成
    context.cookies.set(config.SESSION_COOKIE_NAME, signedSessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: import.meta.env.PROD,
      maxAge: config.SESSION_EXPIRES
    })

    // セッション作成
    await context.locals.session.set(config.SESSION_ID_PREFIX + sessionId, {
      user: user
    })

    return user
  }

  // セッション情報を削除
  // 戻り値: ユーザID - セッション情報が存在しない場合は-1
  async deleteUser(context: APIContext): Promise<number> {
    let userId = -1

    // クッキー取得
    const cookie = context.cookies.get(config.SESSION_COOKIE_NAME)?.value
    if (!cookie) return userId

    // セッション取得
    const unsignedSession = _unsign(cookie, config.SESSION_COOKIE_SECRET)
    if (unsignedSession) {
      // セッションからユーザID取得
      const result = await context.locals.session.get(config.SESSION_ID_PREFIX + unsignedSession)
      if (result) {
        userId = result.user.id
      }

      // セッション破棄
      await context.locals.session.destroy(config.SESSION_ID_PREFIX + unsignedSession)
    }

    // クッキー削除
    context.cookies.delete(config.SESSION_COOKIE_NAME, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: import.meta.env.PROD
    })

    return userId
  }
}

function _sign(value: string, secret: string) {
  return cookieSignature.sign(value, secret)
}

function _unsign(value: string, secret: string) {
  return cookieSignature.unsign(value, secret)
}

export default new Session()
