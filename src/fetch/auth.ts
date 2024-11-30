class AuthFetch {
  async login(email: string, password: string, rememberMe: boolean): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          rememberMe: rememberMe
        })
      })
      return response
    } catch (e) {
      return null
    }
  }
  async logout(): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/logout`, {
        method: 'POST'
      })
      return response
    } catch (e) {
      return null
    }
  }
}
export default new AuthFetch()
