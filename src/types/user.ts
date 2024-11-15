import type { User } from '@prisma/client'

export type UserRole = 'admin' | 'operator' | 'user'

// クライアント側で使用するユーザ認証情報
export interface UserAuth {
  id: number
  email: string
  name: string
  role: string
}

// セッションに保存するユーザ情報
export interface UserSessionData {
  id: number
  email: string
  name: string
  role: UserRole
}

// セッションデータからユーザ認証情報に変換(必要な情報だけ抽出)
export const convertToUserAuth = (user: UserSessionData): UserAuth => {
  const userAuth: UserAuth = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
  return userAuth
}

// Prisma APIからセッションに保存するデータに変換
export const convertToUserSessionData = (user: User): UserSessionData => {
  const { password, createdAt, ...exceptPassword } = user
  const userSessinData: UserSessionData = {
    id: exceptPassword.id,
    email: exceptPassword.email,
    name: exceptPassword.name,
    role: exceptPassword.role as UserRole
  }
  return userSessinData
}
