import { RootState } from '@/redux/store/store'
import { useSelector } from 'react-redux'

export const useAuth = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  return { isAuthenticated, user }
}
