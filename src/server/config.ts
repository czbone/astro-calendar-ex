// サーバ用の定義値をここに設定する
const config = {
  // ### サイトのアクセス制御のパターンによって公開型、非公開型を区別する ###
  // 非公開型: 閲覧するにはログインが必要
  PUBLIC_ROUTES: ['/', '/api/auth/login', '/api/auth/logout'], // アクセス制限しないURL
  // 公開型: 一部にログインが必要なページがある
  PROTECTED_ROUTES: ['/api/admin', '/admin'], // アクセス制限するURL

  SESSION_COOKIE_NAME: import.meta.env.SESSION_COOKIE_NAME || '__session', // クッキー作成用シークレットコード
  SESSION_COOKIE_SECRET: import.meta.env.SESSION_COOKIE_SECRET || 'secret',
  SESSION_EXPIRES: parseInt(import.meta.env.SESSION_EXPIRES || '60 * 30', 10), // 30分
  SESSION_ID_PREFIX: import.meta.env.SESSION_ID_PREFIX || 'sess:', // Redisセッション保存用セッションIDプレフィックス
  SESSION_REDIS_URL: import.meta.env.SESSION_REDIS_URL || 'redis://localhost:6379/'
}
export default config
