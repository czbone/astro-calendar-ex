import { EventDB } from '@/server/db'
import type { EventDetailResponse } from '@/types/event'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params
    const event = await EventDB.getEventById(Number(id))

    if (!event) {
      return new Response(JSON.stringify({ message: 'イベントが見つかりませんでした' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const mappedEvent = {} as EventDetailResponse
    mappedEvent.id = event.id
    mappedEvent.title = event.title
    mappedEvent.allDay = event.isAllDay
    if (event.isAllDay) {
      mappedEvent.start = new Date(event.start)
        .toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })
        .split(' ')[0]!
      mappedEvent.end = new Date(event.end)
        .toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })
        .split(' ')[0]!
    } else {
      mappedEvent.start = new Date(event.start)
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Tokyo'
        })
        .replace(' ', 'T')
      mappedEvent.end = new Date(event.end)
        .toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })
        .replace(' ', 'T')
    }
    //mappedEvent.categoryId = event.categoryId
    mappedEvent.description = event.description || ''

    return new Response(JSON.stringify(mappedEvent), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
