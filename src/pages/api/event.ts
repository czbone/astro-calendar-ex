import { colors } from '@/config/master/category'
import { EventDB } from '@/server/db/index.ts'
import { type EventResponse } from '@/types/event'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')

    // クライアントフォーマット(JST)からDB用フォーマット(UTC)に変換
    // 終日イベントの場合は日付部分のみを使用
    const startDate = new Date(start + 'T00:00:00+09:00')
    const endDate = new Date(end + 'T00:00:00+09:00')
    if (startDate >= endDate) {
      return new Response(JSON.stringify({ message: '開始日は終了日より前でなければなりません' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // イベント取得
    const events = await EventDB.getPublicEvents(startDate, endDate)

    // レスポンス用データ作成
    // DB用フォーマット(UTC)からクライアントフォーマット(JST)に変換
    const mappedEvents = events.map((event) => {
      const mappedEvent = {} as EventResponse

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

      // カテゴリーカラーを取得
      if (colors[event.categoryId]) {
        mappedEvent.color = colors[event.categoryId]!.color
      } else {
        mappedEvent.color = 'black'
      }

      return mappedEvent
    })

    return new Response(JSON.stringify(mappedEvents), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
