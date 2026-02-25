import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

interface AuthState {
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isLoggedIn: !!localStorage.getItem('session')
  }),

  actions: {
    async login(password: string) {
      try {
        const response = await authApi.login(password)

        if (response.success) {
          localStorage.setItem('session', 'active')
          this.isLoggedIn = true
        } else {
          throw new Error(response.message || '認証に失敗しました')
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('ログインに失敗しました')
      }
    },

    logout() {
      localStorage.removeItem('session')
      this.isLoggedIn = false
    },

    checkSession() {
      this.isLoggedIn = !!localStorage.getItem('session')
    }
  }
})

