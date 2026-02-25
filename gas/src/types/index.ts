// API リクエストの型定義
export interface RequestBody {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  data?: unknown
  password?: string
}

// API レスポンスの型定義
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

// ダッシュボードサマリーの型
export interface DashboardSummary {
  month: string
  totalIncome: number
  totalExpense: number
}

// トランザクションの型
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

// カテゴリの型
export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  parentId: number | null
  displayOrder: number
}

// ユーザーの型
export interface User {
  id: number
  name: string
  displayOrder: number
}

