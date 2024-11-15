import Alert from '@/components/Alert'
import { AdminEventFetch } from '@/fetch/admin'
import { modalEventId, notifyEventUpdate, showEventModal } from '@/store/event'
import React, { useEffect, useState } from 'react'

interface EventInfoModalProps {
  isOpen: boolean
  event: any
  onClose: () => void
  userAuth: any
}

const EventInfoModal: React.FC<EventInfoModalProps> = ({ isOpen, event, onClose, userAuth }) => {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false) // 登録完了フラグ

  // メッセージをリセット
  useEffect(() => {
    if (isOpen && event) {
      setSuccess('')
      setError('')
      setCompleted(false)
    }
  }, [isOpen, event])

  if (!isOpen || !event) return null

  // 編集ボタンを押したときの処理
  const handleEditEvent = async () => {
    // イベントIDを設定し、モーダルを表示
    modalEventId.set(event.id)
    showEventModal.set(true)

    // モーダルを閉じる
    onClose()
  }

  // 削除ボタンを押したときの処理
  const handleDeleteEvent = async () => {
    // メッセージリセット
    setSuccess('')
    setError('')

    if (confirm('このイベントを削除しますか？')) {
      try {
        const response = await AdminEventFetch.removeEvent(event.id)
        if (response.ok) {
          setSuccess('イベントを削除しました。')

          // 登録完了
          setCompleted(true)

          // イベントの更新を通知
          notifyEventUpdate()
        } else {
          const errorData = await response.json()
          setError(`削除に失敗しました: ${errorData.message}`)
        }
      } catch (error) {
        setError('通信エラーが発生しました')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50">
      {/* モーダルダイアログ */}
      <div className="relative mb-10 mt-10 w-full max-w-2xl rounded-lg bg-white shadow">
        {/* モーダルコンテンツ部 */}
        <div className="relative rounded-lg bg-white p-4 shadow sm:p-5">
          {/* モーダルヘッダ部 */}
          <div className="mb-4 flex justify-between rounded-t sm:mb-5">
            <div className="text-lg text-gray-900 md:text-xl">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-gray-500">
                {(() => {
                  if (event.allDay) {
                    const startDate = new Date(event.start)

                    // 終了日を1日減らす
                    const adjustedEnd = new Date(event.end)
                    adjustedEnd.setDate(adjustedEnd.getDate() - 1)

                    const formattedStart = new Intl.DateTimeFormat('ja-JP', {
                      dateStyle: 'long'
                    }).format(startDate)
                    const formattedEnd = new Intl.DateTimeFormat('ja-JP', {
                      dateStyle: 'long'
                    }).format(adjustedEnd)

                    if (startDate.toDateString() === adjustedEnd.toDateString()) {
                      // 開始日と終了日が同じ場合
                      return formattedStart
                    } else {
                      const startYear = startDate.getFullYear()
                      const endYear = adjustedEnd.getFullYear()

                      // 開始日と終了日が異なる場合
                      if (startYear === endYear) {
                        // 年が同じ場合、終了日の年を省略
                        const formattedEndDate = new Intl.DateTimeFormat('ja-JP', {
                          month: 'long',
                          day: 'numeric'
                        }).format(adjustedEnd)
                        return `${formattedStart} 〜 ${formattedEndDate}`
                      } else {
                        // 年が異なる場合、年も表示
                        return `${formattedStart} 〜 ${formattedEnd}`
                      }
                    }
                  } else {
                    const startDate = new Date(event.start)
                    const endDate = new Date(event.end)

                    const formattedStartDate = new Intl.DateTimeFormat('ja-JP', {
                      dateStyle: 'long'
                    }).format(startDate)
                    const formattedStartTime = new Intl.DateTimeFormat('ja-JP', {
                      timeStyle: 'short'
                    }).format(startDate)
                    const formattedEndDate = new Intl.DateTimeFormat('ja-JP', {
                      dateStyle: 'long'
                    }).format(endDate)
                    const formattedEndTime = new Intl.DateTimeFormat('ja-JP', {
                      timeStyle: 'short'
                    }).format(endDate)

                    if (formattedStartDate === formattedEndDate) {
                      // 開始日と終了日が同じ場合
                      return `${formattedStartDate} ${formattedStartTime}〜${formattedEndTime}`
                    } else {
                      const startYear = startDate.getFullYear()
                      const endYear = endDate.getFullYear()

                      // 開始日と終了日が異なる場合
                      if (startYear === endYear) {
                        // 年が同じ場合、終了日の年を省略
                        const formattedEndDate = new Intl.DateTimeFormat('ja-JP', {
                          month: 'long',
                          day: 'numeric'
                        }).format(endDate)

                        // 開始日と終了日が異なる場合
                        return `${formattedStartDate} ${formattedStartTime} 〜 ${formattedEndDate} ${formattedEndTime}`
                      } else {
                        // 年が異なる場合、年も表示
                        return `${formattedStartDate} ${formattedStartTime} 〜 ${formattedEndDate} ${formattedEndTime}`
                      }
                    }
                  }
                })()}
              </p>
            </div>
            <div>
              <button
                type="button"
                className="inline-flex rounded-lg bg-transparent p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                onClick={onClose}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">閉じる</span>
              </button>
            </div>
          </div>
          {/* モーダルボディ部 */}
          <>
            {success && <Alert message={success} type="success" />}
            {error && <Alert message={error} type="error" />}
            {event.description && (
              <dl>
                <dt className="mb-1 font-semibold leading-none">内容</dt>
                <dd className="mb-4 text-gray-500 sm:mb-5">{event.description}</dd>
              </dl>
            )}
          </>
          {userAuth && userAuth.role === 'admin' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {!completed && (
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300"
                    onClick={handleEditEvent}
                  >
                    <svg
                      aria-hidden="true"
                      className="-ml-1 mr-1 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    編集
                  </button>
                )}
                {completed && (
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    onClick={onClose}
                  >
                    閉じる
                  </button>
                )}
              </div>
              {!completed && (
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
                  onClick={handleDeleteEvent}
                >
                  <svg
                    aria-hidden="true"
                    className="-ml-1 mr-1.5 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  削除
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventInfoModal
