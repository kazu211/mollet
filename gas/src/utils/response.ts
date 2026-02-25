import type { ApiResponse } from '../types'

/**
 * 成功レスポンスを作成
 */
export function createSuccessResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  }
}

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(message: string): ApiResponse {
  return {
    success: false,
    message
  }
}

/**
 * JSONレスポンスを作成（GAS用）
 */
export function createJsonOutput(response: ApiResponse): GoogleAppsScript.Content.TextOutput {
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
}

