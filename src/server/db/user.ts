import type { User } from '@prisma/client'
import BaseDB from './base'

class UserDB extends BaseDB {
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await BaseDB.prisma.user.findUnique({
        where: {
          email: email
        }
      })
      return user
    } catch (err) {
      console.error(err)
      return null
    }
  }
  async getUserByRememberMeToken(token: string): Promise<User | null> {
    try {
      const user = await BaseDB.prisma.user.findUnique({
        where: {
          rememberMeToken: token,
          rememberMeTokenExpiry: {
            gte: new Date()
          }
        }
      })
      return user
    } catch (err) {
      console.error(err)
      return null
    }
  }
  async updateRememberMe(
    id: number,
    token: string | null,
    tokenExpiry: Date | null
  ): Promise<User | null> {
    try {
      const user = await BaseDB.prisma.user.update({
        where: { id: id },
        data: {
          rememberMeToken: token,
          rememberMeTokenExpiry: tokenExpiry
        }
      })
      return user
    } catch (err) {
      console.error(err)
      return null
    }
  }
}
export default new UserDB()
