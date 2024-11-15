import type { Event } from '@prisma/client'
import BaseDB from './base'

interface AddEventData {
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  categoryId: number
  description?: string
  creatorId: number
}
interface UpdateEventData {
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  categoryId: number
  description?: string
}

interface PublicEvent {
  id: number
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  categoryId: number
}

class EventDB extends BaseDB {
  async getEventById(id: number): Promise<Event | null> {
    try {
      const event = await BaseDB.prisma.event.findUnique({
        where: { id }
      })
      return event
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      const events = await BaseDB.prisma.event.findMany({
        orderBy: [
          {
            start: 'asc'
          }
        ]
      })
      return events
    } catch (err) {
      console.error(err)
      return []
    }
  }
  /**
   * イベント取得(公開用)
   * @param startDate - 取得するイベントの開始日
   * @param endDate - 取得するイベントの終了日
   */
  async getPublicEvents(startDate: Date, endDate: Date): Promise<PublicEvent[]> {
    try {
      const events = await BaseDB.prisma.event.findMany({
        select: {
          id: true,
          title: true,
          start: true,
          end: true,
          isAllDay: true,
          categoryId: true
        },
        where: {
          OR: [
            {
              start: {
                gte: startDate,
                lt: endDate
              }
            },
            {
              end: {
                gt: startDate,
                lte: endDate
              }
            },
            {
              AND: [
                {
                  start: {
                    lt: startDate
                  }
                },
                {
                  end: {
                    gt: endDate
                  }
                }
              ]
            }
          ]
        },
        orderBy: [
          {
            start: 'asc'
          }
        ]
      })
      return events
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async addEvent(data: AddEventData): Promise<Event | null> {
    try {
      const event = await BaseDB.prisma.event.create({
        data: {
          title: data.title,
          start: data.start,
          end: data.end,
          isAllDay: data.isAllDay,
          categoryId: data.categoryId,
          description: data.description,
          creator: {
            connect: {
              id: data.creatorId
            }
          }
        }
      })
      return event
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async updateEvent(id: number, data: UpdateEventData): Promise<Event | null> {
    try {
      const event = await BaseDB.prisma.event.update({
        where: { id },
        data: data
      })
      return event
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async deleteEvent(id: number): Promise<Event | null> {
    try {
      const event = await BaseDB.prisma.event.delete({
        where: { id }
      })
      return event
    } catch (err) {
      console.error(err)
      return null
    }
  }
}

export default new EventDB()
