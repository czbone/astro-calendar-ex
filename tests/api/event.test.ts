import { beforeAll, describe, expect, expectTypeOf, it, test, vi } from 'vitest'

const AUTH_API_URL = `${import.meta.env.PUBLIC_BASE_URL}${import.meta.env.PUBLIC_API_URL}/auth`
const EVENT_API_URL = `${import.meta.env.PUBLIC_BASE_URL}${import.meta.env.PUBLIC_ADMIN_API_URL}/event`
const BEFORE_ALL_TIMEOUT = 30000 // 30 sec
const LOGIN_EMAIL = 'admin@example.com'
const LOGIN_PASSWORD = 'password'

describe('API Routes', () => {
  let response: Response
  let body: Array<{ [key: string]: unknown }>
  let deleteItemId: string
  let cookies: string = ''

  /**
   *テスト環境のセットアップ:
   *テストを実行する前に、既存のデータをすべて削除してテーブルを空にします。
   */
  beforeAll(async () => {
    // 未ログイン状態でのアクセス状況を確認
    response = await fetch(EVENT_API_URL)

    // レスポンスチェック
    expect(response.status).toBe(401) // アクセス不可

    // ログイン
    response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD
      })
    })
    expect(response.status).toBe(200)

    // クッキーの保存
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      cookies = setCookieHeader
    }

    // 既存のデータを削除
    // for (const item of body) {
    //   await fetch(`${import.meta.env.PUBLIC_API_URL}/event/${item.id}`, {
    //     method: 'DELETE'
    //   })
    // }
  }, BEFORE_ALL_TIMEOUT)

  test('一覧を取得', async () => {
    // 再度初期データを取得
    response = await fetch(EVENT_API_URL, {
      method: 'GET',
      headers: {
        Cookie: cookies // 保存したクッキーを使用
      }
    })

    // レスポンスチェック
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    body = await response.json()
    expectTypeOf(body).toBeArray()

    // 2番目のデータ取得
    deleteItemId = body[1]?.id as string
  })
})
