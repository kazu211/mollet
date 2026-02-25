# 開発ガイド（実装エージェント向け）

実装を行う際の詳細な手順と注意点をまとめたドキュメントです。

このドキュメントは **Phase 1～5 のすべての実装手順を含みます** 。

---

## 📋 目次と Phase 概要

### Phase 1: 基盤整備（2-3 日）
**成果物:** ログイン → ダッシュボード表示（動作確認可能）
- Frontend: Vue 3 + Vuetify セットアップ、ログインページ
- GAS: エンドポイント基本構造、認証機能
- **進捗:** [PROGRESS.md Phase 1](PROGRESS.md#phase-1-基盤整備動作確認可能) を参照

### Phase 2: Transaction CRUD（3-4 日）
**成果物:** 収支の登録・編集・削除
- Frontend: フォーム、リスト表示、Pinia Store
- GAS: Spreadsheet 連携、Transaction Service、API
- **進捗:** [PROGRESS.md Phase 2](PROGRESS.md#phase-2-認証機能の完成--transaction-crud) を参照

### Phase 3: マスタデータ管理（1-2 日）
**成果物:** フォームのドロップダウンが動的に表示
- Frontend: Master API・Store
- GAS: Category・User Service
- **進捗:** [PROGRESS.md Phase 3](PROGRESS.md#phase-3-マスタデータ管理) を参照

### Phase 4: 分析機能（3-4 日）
**成果物:** 月別・年別・ユーザー別の分析グラフ
- Frontend: Analysis ページ、グラフコンポーネント
- GAS: Analysis Service、集計ロジック
- **進捗:** [PROGRESS.md Phase 4](PROGRESS.md#phase-4-分析機能) を参照

### Phase 5: 最適化・デプロイ（2-3 日）
**成果物:** テスト実装、CI/CD 設定、GitHub Pages 公開
- Frontend: Vitest テスト、ビルド最適化
- DevOps: GitHub Actions ワークフロー
- **進捗:** [PROGRESS.md Phase 5](PROGRESS.md#phase-5-最適化テストデプロイ) を参照

---

## 🎯 実装フロー

```
Phase 1: 基盤整備
  ↓（2-3 日）
Phase 2 + Phase 3（並列可能）
  ↓（3-4 日）
Phase 4: 分析機能
  ↓（3-4 日）
Phase 5: 最適化・デプロイ
  ↓（2-3 日）
✅ 本番デプロイ完了
```

**合計所要時間:** 約 2-3 週間

---

## 💡 使用方法

1. このドキュメントの該当 Phase セクションを読む
2. [PROGRESS.md](PROGRESS.md) でチェックリストを確認しながら実装
3. 各フェーズ完了後、コミット
4. 次のフェーズに進む

---

### 1.1 必要な情報を確認

実装を開始する前に、以下の情報が揃っていることを確認してください：

- [ ] Google Spreadsheet ID
- [ ] GAS Script ID
- [ ] GAS Web Apps デプロイURL
- [ ] GitHub リポジトリ URL
- [ ] ローカル環境に Node.js 18+ がインストール済み

### 1.2 関連ドキュメント

実装前に必ず以下を読んでください：

1. **[仕様書](specification.md)** - プロジェクト全体の要件
2. **[API 仕様](api.md)** - API エンドポイント仕様
3. **[DB 設計](schema.md)** - Google Spreadsheet のスキーマ
4. **[進捗管理](PROGRESS.md)** - 実装フェーズと進捗チェックリスト

---

## 2. Phase 1 実装詳細

### 2.1 Frontend セットアップ

#### 2.1.1 プロジェクト初期化

```bash
cd frontend
npm create vite@latest . -- --template vue-ts
npm install

# 依存関係インストール
npm install vue-router pinia vuetify axios day.js vee-validate chart.js vue-chartjs
npm install -D @types/node
```

**tsconfig.json の設定ポイント:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2.1.2 Vuetify セットアップ

```typescript
// src/main.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

app.use(vuetify)
```

#### 2.1.3 Vue Router 設定

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

#### 2.1.4 Pinia 認証ストア

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('session')
  }),
  
  actions: {
    async login(password: string) {
      try {
        const response = await fetch(import.meta.env.VITE_GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'POST',
            endpoint: '/auth/login',
            password
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          localStorage.setItem('session', 'active')
          this.isLoggedIn = true
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        throw error
      }
    },
    
    logout() {
      localStorage.removeItem('session')
      this.isLoggedIn = false
    }
  }
})
```

#### 2.1.5 API クライアント

```typescript
// src/api/client.ts
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_GAS_URL
})

export default client
```

```typescript
// src/api/auth.ts
import client from './client'

export const authApi = {
  login: (password: string) =>
    client.post('/', {
      method: 'POST',
      endpoint: '/auth/login',
      password
    })
}
```

#### 2.1.6 ログインページコンポーネント

```vue
<!-- src/pages/Login.vue -->
<template>
  <v-container class="login-container">
    <v-card class="login-card">
      <v-card-title class="text-center mb-4">
        Mollet - 家計簿管理
      </v-card-title>
      
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="password"
          type="password"
          label="パスワード"
          required
          @keyup.enter="handleLogin"
        />
        
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <v-btn
          type="submit"
          color="primary"
          block
          :loading="isLoading"
        >
          ログイン
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    await authStore.login(password.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'ログインに失敗しました'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
```

#### 2.1.7 ダッシュボードページ（簡易版）

```vue
<!-- src/pages/Dashboard.vue -->
<template>
  <div>
    <v-app-bar>
      <v-toolbar-title>Mollet</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="handleLogout">
        ログアウト
      </v-btn>
    </v-app-bar>
    
    <v-container class="mt-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>本月の支出</v-card-title>
            <v-card-text class="text-h4">
              ¥0
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>本月の収入</v-card-title>
            <v-card-text class="text-h4">
              ¥0
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
```

#### 2.1.8 .env.local 作成

```
VITE_GAS_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usercallback
```

---

### 2.2 GAS セットアップ

#### 2.2.1 TypeScript プロジェクト初期化

```bash
cd gas
npm init -y
npm install -D typescript @types/google-apps-script
npm install ts-node
```

#### 2.2.2 tsconfig.json 設定

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 2.2.3 appsscript.json 設定

```json
{
  "timeZone": "Asia/Tokyo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

#### 2.2.4 メインエンドポイント実装

```typescript
// src/main.ts
interface RequestBody {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  data?: any
  password: string
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const requestBody: RequestBody = JSON.parse(e.postData.contents)
    
    // パスワード検証
    if (!verifyPassword(requestBody.password)) {
      return createResponse(false, '認証に失敗しました')
    }
    
    // ルーティング
    switch (requestBody.endpoint) {
      case '/auth/login':
        return createResponse(true, 'ログインに成功しました')
      
      case '/dashboard/summary':
        return createResponse(true, 'OK', {
          month: '2026-02',
          totalIncome: 0,
          totalExpense: 0
        })
      
      default:
        return createResponse(false, 'エンドポイントが見つかりません')
    }
  } catch (error) {
    Logger.log(error)
    return createResponse(false, 'サーバーエラーが発生しました')
  }
}

function verifyPassword(password: string): boolean {
  // 環境変数から GAS_PASSWORD を取得して比較
  const GAS_PASSWORD = PropertiesService.getScriptProperties().getProperty('GAS_PASSWORD')
  return password === GAS_PASSWORD
}

function createResponse(success: boolean, message?: string, data?: any): GoogleAppsScript.Content.TextOutput {
  const response = {
    success,
    ...(message && { message }),
    ...(data && { data })
  }
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
}
```

#### 2.2.5 ビルドスクリプト

package.json に以下を追加：

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

---

### 2.3 GAS Web Apps デプロイ

#### 2.3.1 初回デプロイ手順

1. GAS エディタで左メニュー「デプロイ」→「新しいデプロイ」
2. タイプ: 「ウェブアプリ」
3. 新しい説明: 「Phase 1 - Authentication」
4. 次の者として実行: 自分のアカウント
5. アクセス: 「全員」
6. デプロイボタンをクリック
7. 表示された URL をコピー

#### 2.3.2 デプロイURL の形式

```
https://script.google.com/macros/d/{SCRIPT_ID}/usercallback
```

このURL を Frontend の `VITE_GAS_URL` に設定

---

### 2.4 動作確認

#### 2.4.1 ローカルで確認

**Terminal 1: Frontend**
```bash
cd frontend
npm run dev
# http://localhost:5173 でアクセス
```

**確認内容:**
1. ログインページが表示されること
2. パスワード入力フォームが表示されること
3. ブラウザコンソールにエラーがないこと

#### 2.4.2 Frontend-GAS 連携確認

**Terminal 2: 開発者ツール確認**
```
1. ブラウザの開発者ツール（F12）を開く
2. Network タブを選択
3. ログインページでパスワード入力 → ログインボタンクリック
4. Network タブで GAS へのリクエストが表示されるか確認
5. レスポンスが JSON フォーマットで返却されるか確認
```

---

## 2.5 Phase 2: Transaction CRUD の実装

このフェーズでは、Google Spreadsheet との連携を開始し、収支データの登録・編集・削除機能を実装します。

### 2.5.1 Google Spreadsheet セットアップ

#### 前提準備
1. Google Sheets で新規スプレッドシート作成
2. Spreadsheet ID をコピー（URL から取得）
3. GAS の Script Properties に設定

#### GAS 側の設定

```typescript
// src/utils/constants.ts
export const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
export const SHEET_NAMES = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  USERS: 'users'
}
```

#### Spreadsheet スキーマ作成

手動で以下のシートを作成（またはスクリプトで自動生成）:

**Sheet1: transactions**
```
id | date | type | amount | categoryId | userId | shopName | memo | createdAt | updatedAt
```

**Sheet2: categories**
```
id | name | type | parentId | displayOrder
```

**Sheet3: users**
```
id | name | displayOrder
```

初期データを docs/schema.md を参照して投入

---

### 2.5.2 GAS - Spreadsheet 連携ユーティリティ

```typescript
// src/utils/spreadsheet.ts
function getSheet(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
  return spreadsheet.getSheetByName(sheetName)
}

function getSheetData(sheetName: string): any[] {
  const sheet = getSheet(sheetName)
  const range = sheet.getDataRange()
  const values = range.getValues()
  const headers = values[0]
  
  return values.slice(1).map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index]
    })
    return obj
  })
}

function appendRow(sheetName: string, data: any): void {
  const sheet = getSheet(sheetName)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const row = headers.map(header => data[header] || '')
  sheet.appendRow(row)
}

function updateRow(sheetName: string, id: any, data: any): void {
  const sheet = getSheet(sheetName)
  const range = sheet.getDataRange()
  const values = range.getValues()
  const headers = values[0]
  
  const rowIndex = values.findIndex(row => row[0] === id)
  if (rowIndex === -1) throw new Error('Row not found')
  
  headers.forEach((header, colIndex) => {
    if (data[header] !== undefined) {
      sheet.getRange(rowIndex + 1, colIndex + 1).setValue(data[header])
    }
  })
}

function deleteRow(sheetName: string, id: any): void {
  const sheet = getSheet(sheetName)
  const range = sheet.getDataRange()
  const values = range.getValues()
  
  const rowIndex = values.findIndex(row => row[0] === id)
  if (rowIndex === -1) throw new Error('Row not found')
  
  sheet.deleteRow(rowIndex + 1)
}
```

---

### 2.5.3 GAS - Transaction Service 実装

```typescript
// src/services/TransactionService.ts
import { getSheetData, appendRow, updateRow, deleteRow } from '@/utils/spreadsheet'

interface Transaction {
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

class TransactionService {
  private sheetName = 'transactions'
  
  getByMonth(month: string): Transaction[] {
    const data = getSheetData(this.sheetName)
    return data.filter(t => t.date.startsWith(month))
  }
  
  create(transaction: Transaction): Transaction {
    const now = new Date().toISOString()
    const nextId = Math.max(...getSheetData(this.sheetName).map(t => t.id || 0)) + 1
    
    const newTransaction = {
      ...transaction,
      id: nextId,
      createdAt: now,
      updatedAt: now
    }
    
    appendRow(this.sheetName, newTransaction)
    return newTransaction
  }
  
  update(id: number, transaction: Partial<Transaction>): Transaction {
    const data = transaction as any
    data.updatedAt = new Date().toISOString()
    updateRow(this.sheetName, id, data)
    
    const all = getSheetData(this.sheetName)
    return all.find(t => t.id === id)
  }
  
  delete(id: number): void {
    deleteRow(this.sheetName, id)
  }
  
  getById(id: number): Transaction {
    const data = getSheetData(this.sheetName)
    return data.find(t => t.id === id)
  }
}

export default new TransactionService()
```

---

### 2.5.4 GAS - Transaction ハンドラー実装

```typescript
// src/handlers/transaction.ts
import TransactionService from '@/services/TransactionService'

interface TransactionRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  params?: any
  data?: any
}

export function handleTransaction(req: TransactionRequest): any {
  const { method, endpoint, params, data } = req
  
  if (endpoint === '/transactions' && method === 'GET') {
    return TransactionService.getByMonth(params.month)
  }
  
  if (endpoint === '/transactions' && method === 'POST') {
    return TransactionService.create(data)
  }
  
  const id = parseInt(endpoint.split('/')[2])
  
  if (endpoint.startsWith('/transactions/') && method === 'PUT') {
    return TransactionService.update(id, data)
  }
  
  if (endpoint.startsWith('/transactions/') && method === 'DELETE') {
    TransactionService.delete(id)
    return { message: 'deleted' }
  }
  
  throw new Error('Unknown endpoint')
}
```

---

### 2.5.5 GAS - メインルーティング更新

```typescript
// src/main.ts の doPost 関数を更新
import { handleTransaction } from '@/handlers/transaction'

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const requestBody: RequestBody = JSON.parse(e.postData.contents)
    
    if (!verifyPassword(requestBody.password)) {
      return createResponse(false, '認証に失敗しました')
    }
    
    const { method, endpoint, data, params } = requestBody
    
    // Transaction エンドポイント
    if (endpoint.startsWith('/transactions')) {
      const result = handleTransaction({ method, endpoint, params, data })
      return createResponse(true, 'OK', result)
    }
    
    // その他の既存エンドポイント
    switch (endpoint) {
      case '/auth/login':
        return createResponse(true, 'ログインに成功しました')
      
      default:
        return createResponse(false, 'エンドポイントが見つかりません')
    }
  } catch (error: any) {
    Logger.log(error)
    return createResponse(false, error.message || 'サーバーエラーが発生しました')
  }
}
```

---

### 2.5.6 Frontend - Transaction API

```typescript
// src/api/transaction.ts
import client from './client'

export const transactionApi = {
  list: (month: string, type?: string) =>
    client.post('/', {
      method: 'GET',
      endpoint: '/transactions',
      params: { month, type },
      password: localStorage.getItem('password') || ''
    }),
  
  create: (data: any) =>
    client.post('/', {
      method: 'POST',
      endpoint: '/transactions',
      data,
      password: localStorage.getItem('password') || ''
    }),
  
  update: (id: number, data: any) =>
    client.post('/', {
      method: 'PUT',
      endpoint: `/transactions/${id}`,
      data,
      password: localStorage.getItem('password') || ''
    }),
  
  delete: (id: number) =>
    client.post('/', {
      method: 'DELETE',
      endpoint: `/transactions/${id}`,
      password: localStorage.getItem('password') || ''
    })
}
```

---

### 2.5.7 Frontend - Transaction Store (Pinia)

```typescript
// src/stores/transaction.ts
import { defineStore } from 'pinia'
import { transactionApi } from '@/api/transaction'

interface Transaction {
  id: number
  date: string
  type: 'income' | 'expense'
  amount: number
  categoryId: number
  userId: number
  shopName?: string
  memo?: string
}

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [] as Transaction[],
    currentMonth: new Date().toISOString().slice(0, 7),
    isLoading: false
  }),
  
  actions: {
    async fetchTransactions(month: string) {
      this.isLoading = true
      try {
        const response = await transactionApi.list(month)
        this.transactions = response.data.data || []
        this.currentMonth = month
      } catch (error) {
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async createTransaction(data: Transaction) {
      try {
        const response = await transactionApi.create(data)
        this.transactions.push(response.data.data)
      } catch (error) {
        throw error
      }
    },
    
    async updateTransaction(id: number, data: Partial<Transaction>) {
      try {
        await transactionApi.update(id, data)
        const index = this.transactions.findIndex(t => t.id === id)
        if (index !== -1) {
          this.transactions[index] = { ...this.transactions[index], ...data }
        }
      } catch (error) {
        throw error
      }
    },
    
    async deleteTransaction(id: number) {
      try {
        await transactionApi.delete(id)
        this.transactions = this.transactions.filter(t => t.id !== id)
      } catch (error) {
        throw error
      }
    }
  }
})
```

---

### 2.5.8 Frontend - Transaction List コンポーネント

```vue
<!-- src/components/TransactionList.vue -->
<template>
  <div>
    <v-card>
      <v-card-title>
        {{ currentMonth }} の収支
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="transactions"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn size="small" @click="editTransaction(item)">
            編集
          </v-btn>
          <v-btn size="small" color="error" @click="deleteTransaction(item.id)">
            削除
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTransactionStore } from '@/stores/transaction'

const transactionStore = useTransactionStore()

const headers = [
  { title: '日付', key: 'date' },
  { title: '種類', key: 'type' },
  { title: '金額', key: 'amount' },
  { title: 'カテゴリ', key: 'categoryId' },
  { title: '利用者', key: 'userId' },
  { title: '店舗', key: 'shopName' },
  { title: 'メモ', key: 'memo' },
  { title: '', key: 'actions' }
]

const transactions = computed(() => transactionStore.transactions)
const currentMonth = computed(() => transactionStore.currentMonth)

const editTransaction = (item: any) => {
  // Phase 3 で実装
}

const deleteTransaction = async (id: number) => {
  if (confirm('削除してもよろしいですか？')) {
    await transactionStore.deleteTransaction(id)
  }
}
</script>
```

---

### 2.5.9 Frontend - Transaction Form コンポーネント

```vue
<!-- src/components/TransactionForm.vue -->
<template>
  <v-card>
    <v-card-title>
      {{ isEdit ? '収支編集' : '収支登録' }}
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.date"
          type="date"
          label="日付"
          required
        />
        
        <v-select
          v-model="form.type"
          :items="['expense', 'income']"
          label="種類"
          required
        />
        
        <v-text-field
          v-model.number="form.amount"
          type="number"
          label="金額"
          required
        />
        
        <v-text-field
          v-model="form.categoryId"
          type="number"
          label="カテゴリID"
          required
        />
        
        <v-text-field
          v-model="form.userId"
          type="number"
          label="利用者ID"
          required
        />
        
        <v-text-field
          v-model="form.shopName"
          label="店舗名"
        />
        
        <v-text-field
          v-model="form.memo"
          label="メモ"
        />
        
        <v-btn type="submit" color="primary">
          {{ isEdit ? '更新' : '登録' }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTransactionStore } from '@/stores/transaction'

const props = defineProps({
  isEdit: Boolean,
  initialData: Object
})

const transactionStore = useTransactionStore()

const form = reactive({
  date: props.initialData?.date || new Date().toISOString().slice(0, 10),
  type: props.initialData?.type || 'expense',
  amount: props.initialData?.amount || 0,
  categoryId: props.initialData?.categoryId || 0,
  userId: props.initialData?.userId || 0,
  shopName: props.initialData?.shopName || '',
  memo: props.initialData?.memo || ''
})

const handleSubmit = async () => {
  try {
    if (props.isEdit) {
      await transactionStore.updateTransaction(props.initialData?.id, form)
    } else {
      await transactionStore.createTransaction(form as any)
    }
  } catch (error) {
    console.error(error)
  }
}
</script>
```

---

### 2.5.10 Frontend - Transactions ページ

```vue
<!-- src/pages/Transactions.vue -->
<template>
  <div>
    <v-app-bar>
      <v-toolbar-title>Mollet</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="logout">ログアウト</v-btn>
    </v-app-bar>
    
    <v-container class="mt-4">
      <v-row>
        <v-col cols="12">
          <TransactionForm />
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12">
          <TransactionList />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transaction'
import TransactionForm from '@/components/TransactionForm.vue'
import TransactionList from '@/components/TransactionList.vue'

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

onMounted(async () => {
  await transactionStore.fetchTransactions(transactionStore.currentMonth)
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
```

---

### 2.5.11 ルーティング更新

```typescript
// src/router/index.ts に Transactions ルートを追加
const routes = [
  // ... 既存のルート ...
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/pages/Transactions.vue'),
    meta: { requiresAuth: true }
  }
]
```

---

### 2.5.12 Phase 2 動作確認

1. ローカルで Frontend・GAS サーバー起動
2. ログイン → Transactions ページへ遷移
3. 収支を登録・編集・削除
4. Google Spreadsheet で データが正しく保存されているか確認
5. ブラウザの開発者ツール → Network タブで リクエスト・レスポンス確認

---

## 2.6 Phase 3: マスタデータ管理の実装

---

### 2.6.1 GAS - Category Service

```typescript
// src/services/CategoryService.ts
import { getSheetData } from '@/utils/spreadsheet'

interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  parentId?: number
  displayOrder: number
}

class CategoryService {
  private sheetName = 'categories'
  
  getAll(): Category[] {
    return getSheetData(this.sheetName)
  }
  
  getByType(type: 'income' | 'expense'): Category[] {
    const data = getSheetData(this.sheetName)
    return data.filter(c => c.type === type)
  }
  
  getWithChildren(): any[] {
    const data = getSheetData(this.sheetName)
    const parentCategories = data.filter(c => !c.parentId)
    
    return parentCategories.map(parent => ({
      ...parent,
      children: data.filter(c => c.parentId === parent.id)
    }))
  }
}

export default new CategoryService()
```

---

### 2.6.2 GAS - User Service

```typescript
// src/services/UserService.ts
import { getSheetData } from '@/utils/spreadsheet'

interface User {
  id: number
  name: string
  displayOrder: number
}

class UserService {
  private sheetName = 'users'
  
  getAll(): User[] {
    return getSheetData(this.sheetName)
  }
}

export default new UserService()
```

---

### 2.6.3 GAS - マスタデータハンドラー

```typescript
// src/handlers/master.ts
import CategoryService from '@/services/CategoryService'
import UserService from '@/services/UserService'

export function handleCategories(method: string, params?: any): any {
  if (params?.type) {
    return CategoryService.getByType(params.type)
  }
  return CategoryService.getWithChildren()
}

export function handleUsers(method: string): any {
  return UserService.getAll()
}
```

---

### 2.6.4 GAS - メインルーティング更新

```typescript
// src/main.ts の doPost 関数に追加
import { handleCategories, handleUsers } from '@/handlers/master'

// switch 文に以下を追加：
case '/categories':
  return createResponse(true, 'OK', handleCategories(method, params))

case '/users':
  return createResponse(true, 'OK', handleUsers(method))
```

---

### 2.6.5 Frontend - Master API

```typescript
// src/api/master.ts
import client from './client'

export const masterApi = {
  getCategories: (type?: string) =>
    client.post('/', {
      method: 'GET',
      endpoint: '/categories',
      params: { type },
      password: localStorage.getItem('password') || ''
    }),
  
  getUsers: () =>
    client.post('/', {
      method: 'GET',
      endpoint: '/users',
      password: localStorage.getItem('password') || ''
    })
}
```

---

### 2.6.6 Frontend - Master Store

```typescript
// src/stores/master.ts
import { defineStore } from 'pinia'
import { masterApi } from '@/api/master'

export const useMasterStore = defineStore('master', {
  state: () => ({
    categories: [] as any[],
    users: [] as any[]
  }),
  
  actions: {
    async fetchCategories() {
      const response = await masterApi.getCategories()
      this.categories = response.data.data || []
    },
    
    async fetchUsers() {
      const response = await masterApi.getUsers()
      this.users = response.data.data || []
    },
    
    async init() {
      await Promise.all([
        this.fetchCategories(),
        this.fetchUsers()
      ])
    }
  }
})
```

---

### 2.6.7 App.vue で初期化

```typescript
// src/App.vue のスクリプト部分
import { onMounted } from 'vue'
import { useMasterStore } from '@/stores/master'

const masterStore = useMasterStore()

onMounted(async () => {
  await masterStore.init()
})
```

---

### 2.6.8 TransactionForm を更新（マスタデータ使用）

```vue
<!-- src/components/TransactionForm.vue を更新 -->
<template>
  <!-- ... existing code ... -->
  
  <v-select
    v-model="form.categoryId"
    :items="categoryOptions"
    item-title="name"
    item-value="id"
    label="カテゴリ"
    required
  />
  
  <v-select
    v-model="form.userId"
    :items="masterStore.users"
    item-title="name"
    item-value="id"
    label="利用者"
    required
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMasterStore } from '@/stores/master'

const masterStore = useMasterStore()

const categoryOptions = computed(() => {
  return masterStore.categories.flatMap(parent => [
    parent,
    ...(parent.children || [])
  ])
})
</script>
```

---

## 2.7 Phase 4: 分析機能の実装

---

### 2.7.1 GAS - Analysis Service

```typescript
// src/services/AnalysisService.ts
import { getSheetData } from '@/utils/spreadsheet'
import TransactionService from './TransactionService'
import CategoryService from './CategoryService'
import UserService from './UserService'

class AnalysisService {
  // 月別分析
  getMonthlyAnalysis(month: string): any {
    const transactions = TransactionService.getByMonth(month)
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    // カテゴリ別分析
    const categoryBreakdown = this.getCategoryBreakdown(transactions)
    
    // ユーザー別分析
    const userBreakdown = this.getUserBreakdown(transactions)
    
    return {
      month,
      totalIncome,
      totalExpense,
      categoryBreakdown,
      userBreakdown
    }
  }
  
  // 年別分析
  getYearlyAnalysis(year: number): any {
    const allTransactions = getSheetData('transactions')
    const monthlyData: any[] = []
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const transactions = allTransactions.filter(t => t.date.startsWith(monthStr))
      
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      
      monthlyData.push({
        month: monthStr,
        income,
        expense
      })
    }
    
    return { year, monthlyData }
  }
  
  // ユーザー別分析
  getUserAnalysis(userId: number, month: string): any {
    const transactions = TransactionService.getByMonth(month)
      .filter(t => t.userId === userId)
    
    const user = UserService.getAll().find(u => u.id === userId)
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const categoryBreakdown = this.getCategoryBreakdown(transactions)
    
    return {
      userId,
      userName: user?.name,
      month,
      totalIncome,
      totalExpense,
      categoryBreakdown
    }
  }
  
  private getCategoryBreakdown(transactions: any[]): any[] {
    const categories = CategoryService.getAll()
    const breakdown: any = {}
    
    transactions.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)
      if (!category) return
      
      const categoryName = category.name
      if (!breakdown[categoryName]) {
        breakdown[categoryName] = 0
      }
      breakdown[categoryName] += t.amount || 0
    })
    
    const expenseTotal = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    return Object.entries(breakdown).map(([name, amount]: [string, any]) => ({
      categoryName: name,
      amount,
      percentage: expenseTotal > 0 ? (amount / expenseTotal * 100).toFixed(2) : 0
    }))
  }
  
  private getUserBreakdown(transactions: any[]): any[] {
    const users = UserService.getAll()
    const breakdown: any = {}
    
    transactions.forEach(t => {
      const user = users.find(u => u.id === t.userId)
      if (!user) return
      
      const userName = user.name
      if (!breakdown[userName]) {
        breakdown[userName] = { expense: 0, income: 0 }
      }
      
      if (t.type === 'expense') {
        breakdown[userName].expense += t.amount || 0
      } else {
        breakdown[userName].income += t.amount || 0
      }
    })
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    return Object.entries(breakdown).map(([name, data]: [string, any]) => ({
      userName: name,
      expense: data.expense,
      income: data.income,
      percentage: totalExpense > 0 ? (data.expense / totalExpense * 100).toFixed(2) : 0
    }))
  }
}

export default new AnalysisService()
```

---

### 2.7.2 GAS - Analysis ハンドラー

```typescript
// src/handlers/analysis.ts
import AnalysisService from '@/services/AnalysisService'

export function handleMonthlyAnalysis(params: any): any {
  return AnalysisService.getMonthlyAnalysis(params.month)
}

export function handleYearlyAnalysis(params: any): any {
  return AnalysisService.getYearlyAnalysis(params.year)
}

export function handleUserAnalysis(params: any): any {
  return AnalysisService.getUserAnalysis(params.userId, params.month)
}
```

---

### 2.7.3 GAS - メインルーティング更新

```typescript
// src/main.ts の doPost 関数に追加
import { handleMonthlyAnalysis, handleYearlyAnalysis, handleUserAnalysis } from '@/handlers/analysis'

// switch 文に以下を追加：
case '/analysis/monthly':
  return createResponse(true, 'OK', handleMonthlyAnalysis(params))

case '/analysis/yearly':
  return createResponse(true, 'OK', handleYearlyAnalysis(params))

case '/analysis/user':
  return createResponse(true, 'OK', handleUserAnalysis(params))
```

---

### 2.7.4 Frontend - Analysis API

```typescript
// src/api/analysis.ts
import client from './client'

export const analysisApi = {
  getMonthly: (month: string) =>
    client.post('/', {
      method: 'GET',
      endpoint: '/analysis/monthly',
      params: { month },
      password: localStorage.getItem('password') || ''
    }),
  
  getYearly: (year: number) =>
    client.post('/', {
      method: 'GET',
      endpoint: '/analysis/yearly',
      params: { year },
      password: localStorage.getItem('password') || ''
    }),
  
  getUser: (userId: number, month: string) =>
    client.post('/', {
      method: 'GET',
      endpoint: '/analysis/user',
      params: { userId, month },
      password: localStorage.getItem('password') || ''
    })
}
```

---

### 2.7.5 Frontend - Analysis Store

```typescript
// src/stores/analysis.ts
import { defineStore } from 'pinia'
import { analysisApi } from '@/api/analysis'

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    monthlyAnalysis: null as any,
    yearlyAnalysis: null as any,
    userAnalysis: null as any,
    isLoading: false
  }),
  
  actions: {
    async fetchMonthly(month: string) {
      this.isLoading = true
      try {
        const response = await analysisApi.getMonthly(month)
        this.monthlyAnalysis = response.data.data
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchYearly(year: number) {
      this.isLoading = true
      try {
        const response = await analysisApi.getYearly(year)
        this.yearlyAnalysis = response.data.data
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchUser(userId: number, month: string) {
      this.isLoading = true
      try {
        const response = await analysisApi.getUser(userId, month)
        this.userAnalysis = response.data.data
      } finally {
        this.isLoading = false
      }
    }
  }
})
```

---

### 2.7.6 Frontend - Analysis コンポーネント（グラフ表示）

```vue
<!-- src/components/MonthlyAnalysis.vue -->
<template>
  <v-card v-if="analysis">
    <v-card-title>
      {{ analysis.month }} の分析
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <h3>カテゴリ別支出</h3>
          <canvas ref="categoryChart" />
        </v-col>
        
        <v-col cols="12" md="6">
          <h3>ユーザー別支出</h3>
          <canvas ref="userChart" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useAnalysisStore } from '@/stores/analysis'

Chart.register(...registerables)

const analysisStore = useAnalysisStore()
const categoryChart = ref<HTMLCanvasElement>()
const userChart = ref<HTMLCanvasElement>()

const props = defineProps({
  month: String
})

const analysis = computed(() => analysisStore.monthlyAnalysis)

let categoryChartInstance: Chart | null = null
let userChartInstance: Chart | null = null

const initCharts = () => {
  if (!analysis.value) return
  
  // カテゴリ別グラフ
  if (categoryChartInstance) {
    categoryChartInstance.destroy()
  }
  categoryChartInstance = new Chart(categoryChart.value!, {
    type: 'doughnut',
    data: {
      labels: analysis.value.categoryBreakdown.map((c: any) => c.categoryName),
      datasets: [{
        data: analysis.value.categoryBreakdown.map((c: any) => c.amount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
  
  // ユーザー別グラフ
  if (userChartInstance) {
    userChartInstance.destroy()
  }
  userChartInstance = new Chart(userChart.value!, {
    type: 'doughnut',
    data: {
      labels: analysis.value.userBreakdown.map((u: any) => u.userName),
      datasets: [{
        data: analysis.value.userBreakdown.map((u: any) => u.expense),
        backgroundColor: ['#FF6384', '#36A2EB']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
}

watch([analysis, categoryChart, userChart], () => {
  initCharts()
})

onMounted(async () => {
  if (props.month) {
    await analysisStore.fetchMonthly(props.month)
  }
})
</script>
```

---

### 2.7.7 Frontend - Analysis ページ

```vue
<!-- src/pages/Analysis.vue -->
<template>
  <div>
    <v-app-bar>
      <v-toolbar-title>Mollet - 分析</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" @click="logout">ログアウト</v-btn>
    </v-app-bar>
    
    <v-container class="mt-4">
      <v-tabs v-model="activeTab">
        <v-tab>月別分析</v-tab>
        <v-tab>年別分析</v-tab>
        <v-tab>ユーザー別分析</v-tab>
      </v-tabs>
      
      <v-window v-model="activeTab">
        <v-window-item>
          <v-text-field
            v-model="selectedMonth"
            type="month"
            label="対象月"
            @change="onMonthChange"
          />
          <MonthlyAnalysis :month="selectedMonth" />
        </v-window-item>
        
        <v-window-item>
          <v-text-field
            v-model.number="selectedYear"
            type="number"
            label="対象年"
            @change="onYearChange"
          />
          <YearlyAnalysis :year="selectedYear" />
        </v-window-item>
        
        <v-window-item>
          <v-select
            v-model="selectedUser"
            :items="masterStore.users"
            item-title="name"
            item-value="id"
            label="ユーザー"
          />
          <v-text-field
            v-model="selectedMonth"
            type="month"
            label="対象月"
          />
          <UserAnalysis :user-id="selectedUser" :month="selectedMonth" />
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMasterStore } from '@/stores/master'
import MonthlyAnalysis from '@/components/MonthlyAnalysis.vue'
import YearlyAnalysis from '@/components/YearlyAnalysis.vue'
import UserAnalysis from '@/components/UserAnalysis.vue'

const router = useRouter()
const authStore = useAuthStore()
const masterStore = useMasterStore()

const activeTab = ref(0)
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const selectedYear = ref(new Date().getFullYear())
const selectedUser = ref(null)

const onMonthChange = async () => {
  // 月変更時の処理
}

const onYearChange = async () => {
  // 年変更時の処理
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
```

---

### 2.7.8 ルーティング更新

```typescript
// src/router/index.ts に Analysis ルートを追加
{
  path: '/analysis',
  name: 'Analysis',
  component: () => import('@/pages/Analysis.vue'),
  meta: { requiresAuth: true }
}
```

---

## 2.8 Phase 5: 最適化・テスト・デプロイ

---

### 2.8.1 GitHub Actions ワークフロー

```yaml
# .github/workflows/deploy-gas.yml
name: Deploy GAS

on:
  push:
    branches:
      - main
    paths:
      - 'gas/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install clasp
        run: npm install -g @google/clasp
      
      - name: Setup .clasp.json
        run: |
          cat > gas/.clasp.json << EOF
          {
            "scriptId": "${{ secrets.GAS_SCRIPT_ID }}",
            "rootDir": "./gas/src"
          }
          EOF
      
      - name: Install dependencies
        run: cd gas && npm install
      
      - name: Build
        run: cd gas && npm run build
      
      - name: Setup clasp auth
        run: |
          mkdir -p ~/.config/clasp
          echo '${{ secrets.CLASP_TOKEN }}' > ~/.config/clasp/settings.json
      
      - name: Deploy
        run: cd gas && clasp push --force
```

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build
        run: cd frontend && npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

---

### 2.8.2 Frontend - Vitest テスト例

```typescript
// src/__tests__/stores/auth.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should login successfully', async () => {
    const store = useAuthStore()
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true })
      })
    )
    
    await store.login('password123')
    expect(store.isLoggedIn).toBe(true)
  })
  
  it('should logout', () => {
    const store = useAuthStore()
    store.logout()
    expect(store.isLoggedIn).toBe(false)
  })
})
```

---

### 2.8.3 Frontend - ビルド最適化

```typescript
// vite.config.ts に追加
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vuetify': ['vuetify'],
          'chart': ['chart.js', 'vue-chartjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

---

### 2.8.4 パフォーマンス計測

```typescript
// src/utils/performance.ts
export function logPerformance() {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    console.log('Page Load Time:', pageLoadTime, 'ms')
  }
}
```

---

### 2.8.5 本番チェックリスト

- [ ] GitHub Secrets が正しく設定されている
  - [ ] CLASP_TOKEN
  - [ ] GAS_SCRIPT_ID
- [ ] Google Spreadsheet が正しく準備されている
  - [ ] Spreadsheet ID が GAS に設定済み
  - [ ] 初期データが投入済み
- [ ] GAS Web Apps が デプロイされ、URL が正しく設定されている
- [ ] Frontend の .env.local に GAS_URL が設定されている
- [ ] すべての Phase 1～4 が動作確認済み
- [ ] GitHub Actions ワークフローが正常に実行されることを確認
- [ ] 本番 GitHub Pages にデプロイされていることを確認

---

## 3. 実装時の注意点

### 3.1 Google Spreadsheet との連携

**重要:** Phase 1 では Spreadsheet との連携は実装しません。
ダミーデータをハードコードして返却してください。

```typescript
// 例: ダミー response
function getDashboardSummary(): object {
  return {
    month: '2026-02',
    totalIncome: 200000,
    totalExpense: 100000
  }
}
```

### 3.2 パスワード管理

**現在:** GAS Script Properties に直接格納
**注意:** GitHub リポジトリには含めない

```typescript
// GAS で設定
const GAS_PASSWORD = PropertiesService.getScriptProperties().getProperty('GAS_PASSWORD')
```

### 3.3 CORS 対応

Google Apps Script の Web Apps は自動的に CORS に対応しているため、追加の設定は不要です。

### 3.4 エラーハンドリング

すべての API レスポンスは以下の形式にしてください：

```typescript
{
  "success": true|false,
  "message": "エラーメッセージ（失敗時のみ）",
  "data": { /* データ */ }
}
```

---

## 4. コミット ガイドライン

### 4.1 コミットメッセージ形式

```
feat(frontend): add login page component
fix(gas): fix password verification logic
docs(progress): update Phase 1 checklist
```

### 4.2 Phase 1 完了時のコミット

```bash
git add .
git commit -m "feat(phase1): complete frontend and gas base setup

- Setup Vue 3 + Vite + Vuetify
- Implement login page with form validation
- Setup Google Apps Script base structure
- Implement authentication endpoint
- Test Frontend-GAS integration
- All Phase 1 checklist items completed"

git push origin main
```

---

## 5. トラブルシューティング

### 5.1 GAS へのリクエストが 403 エラー

**原因:** GAS Web Apps のアクセス権が「全員」に設定されていない

**解決策:**
1. GAS エディタで「デプロイを管理」
2. 編集アイコンをクリック
3. アクセス: 「全員」に設定
4. 「デプロイを更新」

### 5.2 TypeScript コンパイルエラー

**原因:** @types/google-apps-script がインストールされていない

**解決策:**
```bash
cd gas
npm install -D @types/google-apps-script
```

### 5.3 Vuetify コンポーネント がレンダリングされない

**原因:** Vuetify プラグインが main.ts で初期化されていない

**解決策:** 上記の「Vuetify セットアップ」セクション を参照

---

## 6. 参考リンク

- [Vue 3 公式ドキュメント](https://vuejs.org/)
- [Vuetify 公式ドキュメント](https://vuetifyjs.com/)
- [Google Apps Script 公式](https://developers.google.com/apps-script)
- [TypeScript 公式](https://www.typescriptlang.org/)

---

## 7. よくある質問（FAQ）

**Q: Phase 1 で Google Spreadsheet と連携する必要ありますか？**  
A: いいえ。Phase 1 ではダミーデータで動作確認のみ。Phase 2 で Spreadsheet 連携を実装します。

**Q: パスワードはハッシュ化する必要がありますか？**  
A: Phase 1 では平文での比較で OK。本番環境では SETUP.md の「パスワード管理」セクションを参照してください。

**Q: テストは Phase 1 で実装する必要がありますか？**  
A: いいえ。Phase 5 で実装します。

---

**不明な点があれば、仕様書の関連セクションを参照してください。**

