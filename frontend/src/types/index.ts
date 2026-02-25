// 認証関連の型定義
export interface LoginRequest {
  method: 'POST'
  endpoint: '/auth/login'
  password: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface DashboardSummary {
  month: string
  totalIncome: number
  totalExpense: number
}

// トランザクション関連（Phase 2以降で使用）
export interface Transaction {
  id?: number
  date: string
  type: 'income' | 'expense'
  amount: number
  categoryId: number
  userId: number
  shopName?: string
  memo?: string
  createdAt?: string
  updatedAt?: string
}

// カテゴリ関連
export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  parentId: number | null
  displayOrder: number
}

// ユーザー関連
export interface User {
  id: number
  name: string
  displayOrder: number
}

