import config from '@/server/config'
import { UserDB } from '@/server/db'
import Session from '@/server/utils/session'
import { convertToUserSessionData, type UserSessionData } from '@/types/user'
import type { APIContext } from 'astro'
import cookieSignature from 'cookie-signature'
import { v4 as uuidv4 } from 'uuid'

class Auth {
  // 「remember me」トークンがある場合はセッション情報を取得
  async getRememberMeUser(context: APIContext): Promise<UserSessionData | null> {
    // クッキー取得
    const cookie = context.cookies.get(config.REMEMBERME_COOKIE_NAME)?.value
    if (!cookie) return null

    // 「remember me」トークン取得
    const rememberMeToken = _unsign(cookie, config.REMEMBERME_COOKIE_SECRET)
    if (!rememberMeToken) return null

    // ユーザ情報取得
    const userWithPassword = await UserDB.getUserByRememberMeToken(rememberMeToken)
    if (!userWithPassword) {
      return null
    }

    // セッション(ユーザ情報)作成
    const sessionData: UserSessionData = convertToUserSessionData(userWithPassword)
    const user = await Session.createUser(context, sessionData)
    return user
  }
  async createRememberMe(context: APIContext, userId: number) {
    // 「remember me」トークン作成
    const rememberMeToken = uuidv4()
    const signedRememberMeToken = _sign(rememberMeToken, config.REMEMBERME_COOKIE_SECRET)
    const rememberMeTokenExpiry = new Date()
    rememberMeTokenExpiry.setDate(rememberMeTokenExpiry.getDate() + config.REMEMBERME_COOKIE_DAYS) // 指定日数有効

    const result = await UserDB.updateRememberMe(userId, rememberMeToken, rememberMeTokenExpiry)
    if (!result) {
      return false
    }

    // 「remember me」トークンをクッキーに保存
    context.cookies.set(config.REMEMBERME_COOKIE_NAME, signedRememberMeToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: import.meta.env.PROD,
      maxAge: config.REMEMBERME_EXPIRES
    })

    return true
  }
  // 「remember me」情報を削除
  // ユーザIDが無効値でもクッキーは削除する
  async removeRememberMe(context: APIContext, userId: number) {
    console.log('DELETE removeRememberMe: ', userId)

    // ユーザ情報の「remember me」トークンをクリア
    if (userId > 0) await UserDB.updateRememberMe(userId, null, null)

    // 「remember me」クッキーを削除
    context.cookies.delete(config.REMEMBERME_COOKIE_NAME, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: import.meta.env.PROD
    })
  }
}
function _sign(value: string, secret: string) {
  return cookieSignature.sign(value, secret)
}

function _unsign(value: string, secret: string) {
  return cookieSignature.unsign(value, secret)
}
export default new Auth()
