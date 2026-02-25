import { createSuccessResponse } from '../utils/response'
import type { ApiResponse, DashboardSummary } from '../types'

/**
 * ダッシュボードサマリー取得ハンドラー
 * Phase 1ではダミーデータを返却
 */
export function getSummaryHandler(month?: string): ApiResponse<DashboardSummary> {
  // 現在の月を取得（指定がない場合）
  const targetMonth = month || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM')

  // Phase 1: ダミーデータを返却
  // Phase 2以降でSpreadsheetから実データを取得
  const summary: DashboardSummary = {
    month: targetMonth,
    totalIncome: 0,
    totalExpense: 0
  }

  return createSuccessResponse(summary)
}

