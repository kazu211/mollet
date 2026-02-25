import { loginHandler, verifyPassword } from './handlers/auth'
import { getSummaryHandler } from './handlers/dashboard'
import { createErrorResponse, createJsonOutput } from './utils/response'
import type { RequestBody } from './types'

/**
 * POST リクエストのエントリーポイント
 */
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const requestBody: RequestBody = JSON.parse(e.postData.contents)
    const { endpoint, password, data } = requestBody

    // ログインエンドポイント以外はパスワード検証
    if (endpoint !== '/auth/login') {
      if (!password || !verifyPassword(password)) {
        return createJsonOutput(createErrorResponse('認証に失敗しました'))
      }
    }

    // ルーティング
    switch (endpoint) {
      case '/auth/login':
        return createJsonOutput(loginHandler(password || ''))

      case '/dashboard/summary':
        return createJsonOutput(getSummaryHandler((data as { month?: string })?.month))

      default:
        return createJsonOutput(createErrorResponse('エンドポイントが見つかりません'))
    }
  } catch (error) {
    Logger.log(error)
    return createJsonOutput(createErrorResponse('サーバーエラーが発生しました'))
  }
}

/**
 * GET リクエストのエントリーポイント（テスト用）
 */
function doGet(): GoogleAppsScript.Content.TextOutput {
  return createJsonOutput({
    success: true,
    message: 'Mollet API is running'
  })
}

// グローバルスコープにエクスポート（GAS用）
declare const global: {
  doPost: typeof doPost
  doGet: typeof doGet
}

global.doPost = doPost
global.doGet = doGet

