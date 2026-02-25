import client from './client'
import type { ApiResponse } from '@/types'

const GAS_URL = import.meta.env.VITE_GAS_URL as string

export const authApi = {
  login: async (password: string): Promise<ApiResponse> => {
    const response = await client.post(GAS_URL, {
      method: 'POST',
      endpoint: '/auth/login',
      password
    })
    return response.data
  }
}

