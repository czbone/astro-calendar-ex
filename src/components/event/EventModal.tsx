import Alert from '@/components/Alert'
import ColorDropdown from '@/components/event/ColorDropdown'
import { AdminEventFetch } from '@/fetch/admin'
import { modalEventId, notifyEventUpdate, showEventModal } from '@/store/event'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import Datepicker from 'react-tailwindcss-datepicker'
import { z } from 'zod'

// フィールドのスキーマを定義
const schema = z
  .object({
    title: z.string().trim().min(1, { message: 'イベント名は必須です' }), // 前後スペースを削除してチェック
    eventDate: z.object({
      startDate: z.date({
        invalid_type_error: '日付は必須です'
      }),
      endDate: z.date()
    }),
    isTimeSettingEnabled: z.boolean(),
    eventTimeStart: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: '開始時間はhh:mm形式で入力してください' })
      .optional()
      .or(z.literal('')),
    eventTimeEnd: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: '終了時間はhh:mm形式で入力してください' })
      .optional()
      .or(z.literal('')),
    category: z.number({ message: 'カテゴリーは必須です' }),
    description: z.string().trim()
  })
  .refine(
    (data) => {
      if (data.isTimeSettingEnabled) {
        return data.eventTimeStart && data.eventTimeEnd
      }
      return true
    },
    {
      message: '時刻は必須です',
      path: ['eventTimeStart', 'eventTimeEnd']
    }
  )

// フォームの入力値の型を上述のスキーマから作成
type FormValues = z.infer<typeof schema>

interface EventModalProps {
  onClose: () => void
}

const EventModal: React.FC<EventModalProps> = ({ onClose }) => {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false) // 登録完了フラグ
  const isModalVisible = useStore(showEventModal)
  const eventId = useStore(modalEventId)

  const {
    control,
    register,
    reset,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),

    // 初期値を設定
    defaultValues: {
      /*eventDate: {
        startDate: new Date('2024-09-21'), // 初期値を設定
        endDate: new Date('2024-09-21')
      },*/
      category: 0 // カテゴリーデフォルト値
    }
  })

  // 時間設定(オプション)を監視
  const isTimeSettingEnabled = watch('isTimeSettingEnabled')

  useEffect(() => {
    // メッセージリセット
    setSuccess('')
    setError('')
    setCompleted(false)

    if (eventId === 0) {
      // フォームをリセット
      reset()
    } else {
      // イベント情報を取得
      // eslint-disable-next-line no-extra-semi
      ;(async () => {
        try {
          const response = await AdminEventFetch.getEvent(eventId)
          if (!response.ok) {
            const errorData = await response.json()
            setError(`データの取得に失敗しました: ${errorData.message}`)
            return
          }
          const eventData = await response.json()

          // 開始日と終了日を取得
          const startDate = new Date(eventData.start.split('T')[0])
          const endDate = new Date(eventData.end.split('T')[0])
          if (eventData.allDay) {
            // 終日イベントの場合、終了日を1日前に設定
            endDate.setDate(endDate.getDate() - 1)
          }

          // 開始日の開始時間と終了日の終了時間をhh:mm形式で取得
          let eventTimeStart = ''
          let eventTimeEnd = ''
          if (!eventData.allDay) {
            if (eventData.start.includes('T')) {
              eventTimeStart = _convertTimeToHHMM(eventData.start.split('T')[1])
            }
            if (eventData.end.includes('T')) {
              eventTimeEnd = _convertTimeToHHMM(eventData.end.split('T')[1])
            }
          }

          // フォームの初期値を設定
          reset({
            title: eventData.title,
            description: eventData.description,
            eventDate: {
              startDate: startDate,
              endDate: endDate
            },
            isTimeSettingEnabled: !eventData.allDay, // 終日イベントかどうか
            eventTimeStart: eventTimeStart,
            eventTimeEnd: eventTimeEnd,
            category: eventData.categoryId
          })
        } catch (e) {
          console.error(e)
          setError('通信エラーが発生しました')
        }
      })()
    }
  }, [eventId, reset])

  const onSubmit = async (values: FormValues) => {
    let start, end
    let response

    // メッセージリセット
    setSuccess('')
    setError('')

    if (isTimeSettingEnabled) {
      start = `${values.eventDate.startDate.toLocaleString('sv-SE').split(' ')[0]}T${values.eventTimeStart}`
      end = `${values.eventDate.endDate.toLocaleString('sv-SE').split(' ')[0]}T${values.eventTimeEnd}`
    } else {
      // *** 終日イベントの場合は終了日を翌日に設定 ***
      const endDate = new Date(values.eventDate.endDate)
      endDate.setDate(endDate.getDate() + 1) // 翌日に設定
      start = values.eventDate.startDate.toLocaleString('sv-SE').split(' ')[0]
      end = endDate.toLocaleString('sv-SE').split(' ')[0] // 翌日の日付を設定
    }

    try {
      if (eventId === 0) {
        // 新規イベントの追加の場合
        response = await AdminEventFetch.addEvent({
          title: values.title,
          allDay: !values.isTimeSettingEnabled, // 終日イベントかどうか
          start: start!,
          end: end!,
          category: values.category,
          description: values.description
        })
      } else {
        // イベントの更新の場合
        response = await AdminEventFetch.updateEvent(eventId, {
          title: values.title,
          allDay: !values.isTimeSettingEnabled, // 終日イベントかどうか
          start: start!,
          end: end!,
          category: values.category,
          description: values.description
        })
      }
      if (response.ok) {
        if (eventId === 0) {
          setSuccess('イベントを追加しました')
        } else {
          setSuccess('イベントを更新しました')
        }

        // 登録完了
        setCompleted(true)

        // イベントの更新をカレンダーに通知
        notifyEventUpdate()
      } else if (response.status === 422) {
        // バリデーションエラー
        const resBody = await response.json()
        if (resBody && resBody.message) {
          setError(resBody.message)
        } else {
          setError('入力データが無効です。再度確認してください。')
        }
      } else if (response.status === 401) {
        setError('アクセス権がありません。再度ログインしてください。')
      } else {
        // # テスト中
        alert(response.status)
        const resBody = await response.json()
        if (resBody && resBody.message) {
          alert(resBody.message)
        }
        setError('サーバでエラーが発生しました')
      }
    } catch (e) {
      setError('通信エラーが発生しました')
    }
  }

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    onClose()
  }

  const onInvalid = (errors: FieldErrors<FormValues>) => {
    // デバッグ用
    console.log('バリデーションエラー発生')
    console.log(errors)
  }

  // 時間設定(オプション)のチェックボックス変更時の処理
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('isTimeSettingEnabled', event.target.checked)
  }

  // 時間をhh:mm形式に変換
  const _convertTimeToHHMM = (time: string): string => {
    const parts = time.split(':')
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`
    } else {
      return time
    }
  }

  if (!isModalVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50">
      {/* モーダルダイアログ */}
      <div className="relative mb-10 mt-10 w-full max-w-2xl rounded-lg bg-white shadow">
        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
          {/* モーダルヘッダ部 */}
          <div className="flex items-start justify-between rounded-t border-b p-5">
            <h3 className="text-xl font-semibold">
              {eventId ? 'イベントを編集' : 'イベントを作成'}
            </h3>
            <button
              type="button"
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              onClick={handleCancel}
            >
              <svg
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
            </button>
          </div>
          {/* モーダルボディ部 */}
          <div className="space-y-4 p-6">
            {success && <Alert message={success} type="success" />}
            {error && <Alert message={error} type="error" />}

            <fieldset disabled={completed}>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <label htmlFor="title" className="mb-1 block font-medium text-gray-900">
                    イベント名
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                      <span className="font-medium">{errors.title.message}</span>
                    </p>
                  )}
                </div>
                <div className="col-span-4">
                  <label htmlFor="date" className="mb-1 block font-medium text-gray-900">
                    日時
                  </label>
                  <Controller
                    name="eventDate"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Datepicker
                        inputId="date"
                        value={value}
                        asSingle={false}
                        useRange={false}
                        onChange={onChange}
                        displayFormat={'YYYY/MM/DD'}
                        i18n="ja"
                        inputClassName="w-full rounded-lg p-2.5 border border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        primaryColor={'indigo'}
                        required
                        readOnly
                      />
                    )}
                  />
                  {errors.eventDate?.startDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                      <span className="font-medium">{errors.eventDate.startDate.message}</span>
                    </p>
                  )}
                </div>
                <div className="col-span-4">
                  <label className="inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      {...register('isTimeSettingEnabled')}
                      className="peer sr-only"
                      onChange={handleCheckboxChange}
                    />
                    <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></div>
                    <span className="ms-3 font-medium text-gray-900">時間設定(オプション)</span>
                  </label>
                </div>
                {isTimeSettingEnabled && (
                  <>
                    <div className="col-span-2">
                      <label htmlFor="start-time" className="mb-1 block font-medium text-gray-900">
                        開始日の開始時間
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 end-0 top-0 flex items-center pe-3.5">
                          <svg
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="time"
                          id="start-time"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 leading-none text-gray-900 focus:border-primary-500 focus:ring-primary-500"
                          {...register('eventTimeStart')}
                          required
                        />
                      </div>
                      {errors.eventTimeStart && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                          <span className="font-medium">{errors.eventTimeStart.message}</span>
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="end-time" className="mb-1 block font-medium text-gray-900">
                        終了日の終了時間
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 end-0 top-0 flex items-center pe-3.5">
                          <svg
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="time"
                          id="end-time"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 leading-none text-gray-900 focus:border-primary-500 focus:ring-primary-500"
                          {...register('eventTimeEnd')}
                          required
                        />
                      </div>
                      {errors.eventTimeEnd && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                          <span className="font-medium">{errors.eventTimeEnd.message}</span>
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div className="col-span-4">
                  <label htmlFor="color-dropdown" className="mb-1 block font-medium text-gray-900">
                    カテゴリー
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <ColorDropdown
                        id="color-dropdown"
                        selectedIndex={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                      <span className="font-medium">{errors.category.message}</span>
                    </p>
                  )}
                </div>
                <div className="col-span-4">
                  <label htmlFor="description" className="mb-1 block font-medium text-gray-900">
                    概要
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
                  ></textarea>
                </div>
              </div>
            </fieldset>
          </div>
          {/* モーダルフッタ部 */}
          <div className="items-center rounded-b border-t border-gray-200 p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {!completed && (
                <button
                  type="submit"
                  className="rounded-lg bg-primary-700 px-5 py-2.5 text-center font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300"
                  disabled={isSubmitting}
                >
                  {eventId ? '更新する' : '追加する'}
                </button>
              )}
              {completed && (
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  onClick={handleCancel}
                >
                  閉じる
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
