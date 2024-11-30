import config from '@/server/config'
import Auth from '@/server/utils/auth'
import RedisSession from '@/server/utils/redis-session'
import Session from '@/server/utils/session'
import { defineMiddleware } from 'astro/middleware'
import Redis from 'ioredis'

// セッション管理用のRedisクライアント作成
const redis = new Redis(config.SESSION_REDIS_URL)
const redisSession = new RedisSession({ client: redis, ttl: config.SESSION_EXPIRES })

export const auth = defineMiddleware(async (context, next) => {
  // Redisセッション管理用APIを取得
  context.locals.session = redisSession

  // セッションからユーザ情報取得
  const user = await Session.getUser(context)
  if (user) {
    context.locals.user = user

    return next()
  } else {
    // セッションがない場合は「remember me」からユーザ情報取得
    const user = await Auth.getRememberMeUser(context)
    if (user) {
      context.locals.user = user

      return next()
    } else {
      // ### サイトのアクセス制御のパターンによって公開型、非公開型を区別する ###
      // 非公開型: 閲覧するにはログインが必要
      /*
      if (config.PUBLIC_ROUTES.includes(context.url.pathname)) {
        // アクセス制限しないURLの場合
        return next()
      } else if (context.url.pathname.startsWith('/api/')) {
        // APIはアクセス不可
        return new Response(JSON.stringify({ message: 'アクセスできません' }), {
          status: 401
        })
      } else {
        // それ以外はルートにリダイレクト
        return Response.redirect(new URL('/', context.url))
      }*/
      // 公開型: 一部にログインが必要なページがある
      //if (config.PROTECTED_ROUTES.includes(context.url.pathname)) {
      const result = config.PROTECTED_ROUTES.some((path) => context.url.pathname.startsWith(path))
      if (result) {
        // 管理画面と管理用APIはアクセス不可
        return new Response(JSON.stringify({ message: 'アクセスできません' }), {
          status: 401
        })
      } else {
        return next()
      }
    }
  }
})
