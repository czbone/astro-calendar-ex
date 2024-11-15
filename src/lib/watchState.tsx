import { useEffect, useRef } from 'react'

const useWatch = (value: any, callBack = (previousValue: any, newValue: any) => {}) => {
  const ref = useRef(null)
  useEffect(() => {
    ref.current = value
  }, [])

  useEffect(() => {
    const triggerCallback = async (newValue: any, previousValue: any) => {
      // 初期値設定時はコールバックを実行しない
      if (newValue === previousValue) return

      await callBack(newValue, previousValue)
      ref.current = value
    }
    triggerCallback(value, ref.current)
  }, [value])
}

export default useWatch
