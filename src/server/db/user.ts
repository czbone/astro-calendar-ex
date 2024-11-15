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
}
export default new UserDB()
