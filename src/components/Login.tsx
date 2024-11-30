import Alert from '@/components/Alert'
import AuthFetch from '@/fetch/auth.ts'
import { type FormEventHandler, useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  const login: FormEventHandler<HTMLFormElement> = async (event) => {
    // イベントキャンセル
    event.preventDefault()

    // ログイン処理
    const response = await AuthFetch.login(email, password, rememberMe)
    if (response) {
      if (response.status === 200) {
        // ログイン成功の場合
        window.location.href = '/'
      } else {
        console.log(response)
        setError('ログインに失敗しました')
      }
    } else {
      alert('エラーが発生しました')
    }
  }

  return (
    <div className="w-full space-y-8 rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
      {error && <Alert message={error} type="error" />}
      <form className="mt-8 space-y-6" onSubmit={login}>
        <div>
          <label htmlFor="email" className="mb-1 block font-medium text-gray-900">
            Eメール
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block font-medium text-gray-900">
            パスワード
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label htmlFor="rememberMe" className="inline-flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-gray-900">ログイン状態を保持する</span>
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-700 px-5 py-2.5 text-center font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300"
        >
          ログイン
        </button>
      </form>
    </div>
  )
}
