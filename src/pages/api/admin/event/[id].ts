import { EventDB } from '@/server/db'
import type { EventAdminRequest, EventAdminResponse } from '@/types/event'
import type { APIRoute } from 'astro'

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return new Response(JSON.stringify({ message: '有効なIDが指定されていません' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const result = await EventDB.deleteEvent(id)

    return new Response(JSON.stringify({ message: 'データを削除しました' }), {
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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // リクエストパラメータ:
    // - title: イベントのタイトル (string)
    // - start: イベントの開始日時 (string, フォーマット「YYYY-MM-DDThh:mm」)
    // - end: イベントの終了日時 (string, フォーマット「YYYY-MM-DDThh:mm」)
    // - allDay: 終日イベントかどうかを示すフラグ (boolean)
    let errMessage = ''
    let startDate, endDate
    const body = await request.json()
    const { title, start, end, allDay, category, description } = body as EventAdminRequest
    const { id } = params

    // JSTからUTCに変換してDateオブジェクトを生成
    if (allDay) {
      // 終日イベントの場合は日付部分のみを使用
      startDate = new Date(start + 'T00:00:00+09:00')
      endDate = new Date(end + 'T00:00:00+09:00')
    } else {
      // 通常のイベントの場合は時間部分も含めて生成
      startDate = new Date(start + '+0900')
      endDate = new Date(end + '+0900')
    }

    // 開始日時<終了日時のチェック
    if (startDate >= endDate) {
      if (allDay) {
        errMessage = '開始日は終了日より前でなければなりません'
      } else {
        errMessage = '開始時間は終了時間より前でなければなりません'
      }
      return new Response(JSON.stringify({ message: errMessage }), {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    if (title.length === 0) {
      return new Response(JSON.stringify({ message: 'データ登録に失敗しました' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const event = await EventDB.updateEvent(Number(id), {
      title: title,
      start: startDate,
      end: endDate,
      isAllDay: allDay,
      categoryId: category,
      description: description
    })

    return new Response(JSON.stringify(event), {
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

    const mappedEvent = {} as EventAdminResponse
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
    mappedEvent.categoryId = event.categoryId

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
