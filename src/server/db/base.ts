import { PrismaClient } from '@prisma/client'

export default class BaseDB {
  // Prismaクライアント生成
  static prisma: PrismaClient = new PrismaClient()
}
