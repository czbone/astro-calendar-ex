import { atom } from 'nanostores'

/*
 * イベント更新通知用ストア
 */
const isEventUpdated = atom<number>(0)

// イベントの更新を通知
const notifyEventUpdate = () => {
  isEventUpdated.set(isEventUpdated.get() === 0 ? 1 : 0)
}

export { isEventUpdated, notifyEventUpdate }

/*
 * モーダル起動用ストア
 */
const showEventModal = atom<boolean>(false)
const modalEventId = atom<number>(0)

export { modalEventId, showEventModal }
