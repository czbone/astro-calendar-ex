import { EventDB } from '@/server/db'
import type { EventAdminRequest } from '@/types/event'
import type { APIRoute } from 'astro'

// Event API
export const GET: APIRoute = async () => {
  const events = await EventDB.getEvents()

  return new Response(JSON.stringify(events), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // リクエストパラメータ:
    // - title: イベントのタイトル (string)
    // - start: イベントの開始日時 (string, フォーマット「YYYY-MM-DDThh:mm」)
    // - end: イベントの終了日時 (string, フォーマット「YYYY-MM-DDThh:mm」)
    // - allDay: 終日イベントかどうかを示すフラグ (boolean)
    const body = await request.json()
    const { title, start, end, allDay, category, description } = body as EventAdminRequest
    let errMessage = ''
    let startDate, endDate

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

    const event = await EventDB.addEvent({
      title: title,
      start: startDate,
      end: endDate,
      isAllDay: allDay,
      categoryId: category,
      description: description,
      creatorId: locals.user.id
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
