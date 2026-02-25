import { createSuccessResponse, createErrorResponse } from '../utils/response'
import type { ApiResponse } from '../types'

/**
 * パスワード検証
 */
export function verifyPassword(password: string): boolean {
  const GAS_PASSWORD = PropertiesService.getScriptProperties().getProperty('GAS_PASSWORD')
  return password === GAS_PASSWORD
}

/**
 * ログインハンドラー
 */
export function loginHandler(password: string): ApiResponse {
  if (verifyPassword(password)) {
    return createSuccessResponse(undefined, 'ログインに成功しました')
  }
  return createErrorResponse('パスワードが正しくありません')
}

