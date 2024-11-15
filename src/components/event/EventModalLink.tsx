import EventModal from '@/components/event/EventModal'
import { modalEventId, showEventModal } from '@/store/event'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function EventModalLink() {
  const isModalVisible = useStore(showEventModal)

  const handleClick = () => {
    // メニューを非表示にする
    const dropdown = document.getElementById('dropdownNavbar')
    if (dropdown) {
      dropdown.style.visibility = 'hidden'
    }

    // イベントIDを設定し、モーダルを表示
    modalEventId.set(0)
    showEventModal.set(true)
  }

  const handleClose = () => {
    // モーダルを非表示
    showEventModal.set(false)

    // メニューの状態を元に戻す
    const dropdown = document.getElementById('dropdownNavbar')
    if (dropdown) {
      dropdown.style.visibility = 'visible'
    }
  }

  useEffect(() => {
    // モーダルが閉じられたときにメニューを表示
    if (!isModalVisible) {
      const dropdown = document.getElementById('dropdownNavbar')
      if (dropdown) {
        dropdown.style.visibility = 'visible'
      }
    }
  }, [isModalVisible])

  return (
    <>
      <a href="#" className="block px-4 py-2 hover:bg-gray-100" onClick={handleClick}>
        新規に作成
      </a>
      {isModalVisible && createPortal(<EventModal onClose={handleClose} />, document.body)}
    </>
  )
}
