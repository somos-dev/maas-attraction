import { useAuth } from "./use-auth"

export const useRole = () => {
  const { user } = useAuth()

  return {
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isModerator: user?.role === 'moderator',
  }
}
