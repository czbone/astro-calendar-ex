import { userStore } from '@/store/user'
import { useEffect } from 'react'

interface UserStoreInitializerProps {
  userAuth: any
}

const UserStoreInitializer: React.FC<UserStoreInitializerProps> = ({ userAuth }) => {
  useEffect(() => {
    // ユーザー認証情報をストアに設定
    userStore.set(userAuth)
  }, [userAuth])

  return null // UIをレンダリングしない
}

export default UserStoreInitializer
