# 実装進捗管理

このドキュメントで実装の進捗を管理します。各フェーズの完了時にチェックボックスをマークしてください。

---

## Phase 1: 基盤整備（動作確認可能）

このフェーズ完了後、ログイン → ダッシュボード表示まで動作確認可能

### 1.1 Frontend セットアップ

#### 1.1.1 プロジェクト初期化
- [x] Vite + Vue 3 プロジェクト作成
- [x] TypeScript 設定
- [x] package.json 依存関係インストール
  - vue, vue-router, pinia, vuetify, axios, day.js, vee-validate, chart.js, vue-chartjs

#### 1.1.2 基本フォルダ構成
- [x] `src/components/` フォルダ作成
- [x] `src/pages/` フォルダ作成
- [x] `src/stores/` フォルダ作成（Pinia）
- [x] `src/api/` フォルダ作成
- [x] `src/types/` フォルダ作成
- [x] `src/utils/` フォルダ作成

#### 1.1.3 Vue Router 設定
- [x] routes/index.ts 作成
- [x] ログインページへのルート定義
- [x] ダッシュボードページへのルート定義
- [x] 認証ガード実装（ログインチェック）

#### 1.1.4 Pinia 状態管理
- [x] stores/auth.ts 作成（認証状態）
  - パスワード入力フォーム状態
  - ログイン状態管理
  - セッション（ローカルストレージ）

#### 1.1.5 API 通信層
- [x] api/client.ts 作成（Axios インスタンス）
  - GAS_URL 環境変数から取得
  - リクエストインターセプタ（パスワード追加）
- [x] api/auth.ts 作成（認証 API）
  - login(password: string) 関数

#### 1.1.6 Vuetify セットアップ
- [x] Vuetify プラグイン設定
- [x] グローバルテーマ設定
- [x] レスポンシブ対応設定

#### 1.1.7 ログインページコンポーネント
- [x] pages/Login.vue 作成
  - パスワード入力フォーム
  - ログインボタン
  - エラーメッセージ表示
  - フォーム検証（Vee-validate）

#### 1.1.8 ダッシュボードページコンポーネント（簡易版）
- [x] pages/Dashboard.vue 作成
  - ページのヒナ形のみ
  - 「本月の支出」「本月の収入」の表示スペース
  - ログアウトボタン
- [x] components/LayoutHeader.vue 作成
  - アプリタイトル
  - ログアウトボタン

#### 1.1.9 環境変数設定
- [x] .env.example 作成（テンプレート）
- [x] .env.local 作成（ローカル開発用）
  - VITE_GAS_URL の設定

#### 1.1.10 ローカル開発確認
- [x] `npm run dev` でサーバー起動確認
- [x] http://localhost:5173 でアクセス確認
- [x] ログインページ表示確認

**Subtask完了条件**: Frontend は GAS 接続前の状態で起動確認できること ✅

---

### 1.2 GAS セットアップ

#### 1.2.1 Google Apps Script プロジェクト作成
- [ ] GAS で新規プロジェクト作成（Mollet）
- [ ] Script ID をメモ
- [x] appsscript.json に timeZone: "Asia/Tokyo" を設定

#### 1.2.2 clasp セットアップ
- [ ] clasp login で認証
- [ ] ローカル gas フォルダで clasp clone {SCRIPT_ID} 実行
- [ ] .clasp.json 作成確認

#### 1.2.3 TypeScript セットアップ
- [x] gas/tsconfig.json 作成
- [x] gas/package.json に必要な依存関係を追加
- [x] npm install 実行

#### 1.2.4 プロジェクト構成
- [x] gas/src/ フォルダ作成
- [x] gas/src/main.ts 作成
- [x] gas/src/handlers/ フォルダ作成
- [x] gas/src/services/ フォルダ作成
- [x] gas/src/types/ フォルダ作成
- [x] gas/src/utils/ フォルダ作成

#### 1.2.5 ビルド設定
- [x] gas/package.json に build スクリプト設定
  - TypeScript → JavaScript コンパイル
  - 出力先: gas/dist/

#### 1.2.6 環境変数管理
- [x] gas/.env.example 作成
  - SPREADSHEET_ID（ダミー値）
  - GAS_PASSWORD（ダミー値）

#### 1.2.7 基本エンドポイント実装
- [x] main.ts にエントリーポイント実装
  - doPost(e) 関数実装
  - method フィールド解析
  - ルーティング処理

#### 1.2.8 認証エンドポイント
- [x] handlers/auth.ts 作成
  - loginHandler(password: string) 実装
  - パスワード検証ロジック（環境変数と比較）
  - 成功時: { success: true }
  - 失敗時: { success: false, message: "認証に失敗しました" }

#### 1.2.9 ダミーエンドポイント
- [x] handlers/dashboard.ts 作成
  - getSummary(month: string) 実装
  - ダミーレスポンス返却:
    ```json
    {
      "month": "2026-02",
      "totalIncome": 200000,
      "totalExpense": 100000
    }
    ```

#### 1.2.10 エラーハンドリング
- [x] utils/response.ts 作成
  - エラーレスポンス共通フォーマット

#### 1.2.11 ローカルビルド・テスト
- [x] `npm run build` でコンパイル成功確認
- [x] gas/dist/ にコンパイル済みファイル確認

#### 1.2.12 GAS Web Apps デプロイ
- [ ] GAS エディタで新規デプロイ作成
  - タイプ: ウェブアプリ
  - 実行ユーザー: 自分のアカウント
  - アクセス: 全員
- [ ] デプロイURL取得してメモ
- [ ] `clasp push` で初回デプロイ実行

**Subtask完了条件**: GAS が Web Apps として公開され、デプロイURL が取得できること ⏳ (手動デプロイ待ち)

---

### 1.3 統合テスト

#### 1.3.1 Frontend-GAS 接続確認
- [ ] Frontend の VITE_GAS_URL にデプロイURL を設定
- [ ] ローカルで Frontend サーバー起動
- [ ] ログインページで正しいパスワード入力 → ダッシュボード遷移確認
- [ ] ログインページで誤ったパスワード入力 → エラーメッセージ表示確認
- [ ] ログアウト → ログインページへ遷移確認

#### 1.3.2 ネットワーク通信確認
- [ ] ブラウザの開発者ツール（Network タブ）で GAS への POST リクエスト確認
- [ ] レスポンスが JSON フォーマットで返却確認

**Subtask完了条件**: ログイン・ログアウト・ダッシュボード遷移が一通り動作すること ⏳ (GASデプロイ後に確認)

---

### 1.4 コミット

- [ ] Phase 1 の実装をコミット
  - commit message: `feat(phase1): setup frontend, gas base structure`
  - ログイン機能まで実装完了

---

## Phase 2: 認証機能の完成 + Transaction CRUD

このフェーズ完了後、データの登録・編集・削除が可能

### 2.1 Frontend - Transaction 管理画面

- [ ] pages/Transactions.vue 作成
- [ ] components/TransactionForm.vue （新規・編集フォーム）
- [ ] components/TransactionList.vue （一覧表示）
- [ ] stores/transaction.ts （Pinia ストア）
- [ ] api/transaction.ts （API 通信）

### 2.2 GAS - Transaction API

- [ ] GET /transactions エンドポイント
- [ ] POST /transactions エンドポイント
- [ ] PUT /transactions/{id} エンドポイント
- [ ] DELETE /transactions/{id} エンドポイント
- [ ] services/TransactionService.ts 実装
  - Google Spreadsheet との連携

### 2.3 Google Spreadsheet 連携

- [ ] Spreadsheet ID を GAS に設定
- [ ] transactions シート読み書き実装

---

## Phase 3: マスタデータ管理

### 3.1 Frontend - マスタデータ表示

- [ ] Category・User の API 呼び出し実装
- [ ] フォームのドロップダウン選択肢に反映

### 3.2 GAS - マスタデータ API

- [ ] GET /categories エンドポイント
- [ ] GET /users エンドポイント

---

## Phase 4: 分析機能

### 4.1 Frontend - 分析画面

- [ ] pages/Analysis.vue 作成
- [ ] 月別分析表示
- [ ] 年別分析表示
- [ ] ユーザー別分析表示
- [ ] Chart.js グラフ表示

### 4.2 GAS - 分析 API

- [ ] GET /analysis/monthly エンドポイント
- [ ] GET /analysis/yearly エンドポイント
- [ ] GET /analysis/user エンドポイント

---

## Phase 5: 最適化 + テスト + デプロイ設定

### 5.1 フロントエンド最適化

- [ ] バンドルサイズ最適化
- [ ] キャッシング戦略実装

### 5.2 テスト

- [ ] Vitest + Vue Test Utils でテスト実装

### 5.3 GitHub Actions ワークフロー

- [ ] .github/workflows/deploy-gas.yml 設定
- [ ] .github/workflows/deploy-frontend.yml 設定

### 5.4 デプロイ

- [ ] GitHub Pages へのデプロイ設定
- [ ] GAS への自動デプロイ設定

---

## Phase 2: 認証機能の完成 + Transaction CRUD

このフェーズ完了後、データの登録・編集・削除が可能

### 2.1 Frontend - Transaction 管理画面

- [ ] pages/Transactions.vue 作成
  - [ ] ページレイアウト実装
  - [ ] ナビゲーションバー
  - [ ] ログアウトボタン
  
- [ ] components/TransactionForm.vue 作成（新規・編集フォーム）
  - [ ] 日付フィールド
  - [ ] 種類セレクト（支出/収入）
  - [ ] 金額フィールド
  - [ ] カテゴリID フィールド
  - [ ] ユーザーID フィールド
  - [ ] 店舗名フィールド（オプション）
  - [ ] メモフィールド（オプション）
  - [ ] フォーム送信ボタン
  
- [ ] components/TransactionList.vue 作成（一覧表示）
  - [ ] データテーブル表示
  - [ ] 編集ボタン
  - [ ] 削除ボタン
  
- [ ] stores/transaction.ts 作成（Pinia ストア）
  - [ ] transactions 状態
  - [ ] currentMonth 状態
  - [ ] isLoading 状態
  - [ ] fetchTransactions() アクション
  - [ ] createTransaction() アクション
  - [ ] updateTransaction() アクション
  - [ ] deleteTransaction() アクション
  
- [ ] api/transaction.ts 作成（API 通信）
  - [ ] list() メソッド
  - [ ] create() メソッド
  - [ ] update() メソッド
  - [ ] delete() メソッド

### 2.2 GAS - Spreadsheet 連携

- [ ] gas/src/utils/spreadsheet.ts 作成
  - [ ] getSheet() 関数
  - [ ] getSheetData() 関数
  - [ ] appendRow() 関数
  - [ ] updateRow() 関数
  - [ ] deleteRow() 関数

- [ ] gas/src/services/TransactionService.ts 作成
  - [ ] getByMonth() メソッド
  - [ ] create() メソッド
  - [ ] update() メソッド
  - [ ] delete() メソッド
  - [ ] getById() メソッド

- [ ] gas/src/handlers/transaction.ts 作成
  - [ ] GET /transactions ハンドラー
  - [ ] POST /transactions ハンドラー
  - [ ] PUT /transactions/{id} ハンドラー
  - [ ] DELETE /transactions/{id} ハンドラー

- [ ] gas/src/main.ts を更新
  - [ ] doPost() でエンドポイント判定を追加
  - [ ] handleTransaction() を呼び出し

### 2.3 Google Spreadsheet 初期化

- [ ] transactions シートを作成
- [ ] ヘッダー行を追加
- [ ] categories シート初期データ投入
- [ ] users シート初期データ投入（2人以上）

### 2.4 統合テスト

- [ ] ログイン → Transactions ページへ遷移
- [ ] 新規収支登録 → Google Spreadsheet に保存確認
- [ ] 収支編集 → 変更が反映確認
- [ ] 収支削除 → 削除が反映確認
- [ ] ブラウザ開発者ツール で API リクエスト・レスポンス確認

### 2.5 コミット

- [ ] Phase 2 の実装をコミット
  - commit message: `feat(phase2): implement transaction crud with spreadsheet integration`

---

## Phase 3: マスタデータ管理

### 3.1 GAS - Category Service

- [ ] gas/src/services/CategoryService.ts 作成
  - [ ] getAll() メソッド
  - [ ] getByType() メソッド
  - [ ] getWithChildren() メソッド（親・子階層）

- [ ] gas/src/services/UserService.ts 作成
  - [ ] getAll() メソッド

### 3.2 GAS - マスタデータハンドラー

- [ ] gas/src/handlers/master.ts 作成
  - [ ] handleCategories() 関数
  - [ ] handleUsers() 関数

- [ ] gas/src/main.ts を更新
  - [ ] /categories エンドポイント追加
  - [ ] /users エンドポイント追加

### 3.3 Frontend - Master API

- [ ] src/api/master.ts 作成
  - [ ] getCategories() メソッド
  - [ ] getUsers() メソッド

- [ ] src/stores/master.ts 作成
  - [ ] categories 状態
  - [ ] users 状態
  - [ ] fetchCategories() アクション
  - [ ] fetchUsers() アクション
  - [ ] init() アクション

### 3.4 Frontend - マスタデータ表示

- [ ] src/App.vue を更新
  - [ ] onMounted で masterStore.init() を呼び出し

- [ ] components/TransactionForm.vue を更新
  - [ ] カテゴリ セレクトボックスに マスタデータを反映
  - [ ] ユーザー セレクトボックスに マスタデータを反映

### 3.5 動作確認

- [ ] ページ読み込み時に Category・User が表示される
- [ ] フォームのドロップダウンが正しく表示される
- [ ] マスタデータから値が選択できる

### 3.6 コミット

- [ ] Phase 3 の実装をコミット
  - commit message: `feat(phase3): implement master data management for categories and users`

---

## Phase 4: 分析機能

### 4.1 GAS - Analysis Service

- [ ] gas/src/services/AnalysisService.ts 作成
  - [ ] getMonthlyAnalysis() メソッド
    - [ ] totalIncome 計算
    - [ ] totalExpense 計算
    - [ ] getCategoryBreakdown() 呼び出し
    - [ ] getUserBreakdown() 呼び出し
  - [ ] getYearlyAnalysis() メソッド
    - [ ] 12ヶ月分のデータ集計
    - [ ] 月ごとの income/expense
  - [ ] getUserAnalysis() メソッド
    - [ ] ユーザー別フィルタリング
    - [ ] カテゴリ別分析
  - [ ] getCategoryBreakdown() プライベートメソッド
  - [ ] getUserBreakdown() プライベートメソッド

### 4.2 GAS - Analysis ハンドラー

- [ ] gas/src/handlers/analysis.ts 作成
  - [ ] handleMonthlyAnalysis() 関数
  - [ ] handleYearlyAnalysis() 関数
  - [ ] handleUserAnalysis() 関数

- [ ] gas/src/main.ts を更新
  - [ ] /analysis/monthly エンドポイント追加
  - [ ] /analysis/yearly エンドポイント追加
  - [ ] /analysis/user エンドポイント追加

### 4.3 Frontend - Analysis API

- [ ] src/api/analysis.ts 作成
  - [ ] getMonthly() メソッド
  - [ ] getYearly() メソッド
  - [ ] getUser() メソッド

- [ ] src/stores/analysis.ts 作成
  - [ ] monthlyAnalysis 状態
  - [ ] yearlyAnalysis 状態
  - [ ] userAnalysis 状態
  - [ ] isLoading 状態
  - [ ] fetchMonthly() アクション
  - [ ] fetchYearly() アクション
  - [ ] fetchUser() アクション

### 4.4 Frontend - 分析グラフコンポーネント

- [ ] src/components/MonthlyAnalysis.vue 作成
  - [ ] カテゴリ別支出の円グラフ
  - [ ] ユーザー別支出の円グラフ
  - [ ] Chart.js 初期化

- [ ] src/components/YearlyAnalysis.vue 作成
  - [ ] 年の月次推移 棒グラフ
  - [ ] income/expense の推移

- [ ] src/components/UserAnalysis.vue 作成
  - [ ] 利用者別の支出分析
  - [ ] カテゴリ別分析

### 4.5 Frontend - Analysis ページ

- [ ] src/pages/Analysis.vue 作成
  - [ ] タブナビゲーション
    - [ ] 月別分析タブ
    - [ ] 年別分析タブ
    - [ ] ユーザー別分析タブ
  - [ ] 月選択フィールド
  - [ ] 年選択フィールド
  - [ ] ユーザー選択ドロップダウン
  - [ ] ロゴアウトボタン

### 4.6 ルーティング更新

- [ ] src/router/index.ts に /analysis ルート追加

### 4.7 ナビゲーション更新

- [ ] コンポーネント間のナビゲーションリンク追加
  - [ ] Dashboard → Transactions
  - [ ] Dashboard → Analysis
  - [ ] すべてのページにログアウトボタン

### 4.8 動作確認

- [ ] 月別分析ページでグラフが表示される
- [ ] 年別分析ページで月次推移が表示される
- [ ] ユーザー別分析で該当ユーザーの分析が表示される
- [ ] グラフデータが正しく計算されている

### 4.9 コミット

- [ ] Phase 4 の実装をコミット
  - commit message: `feat(phase4): implement analysis features with charts`

---

## Phase 5: 最適化・テスト・デプロイ

### 5.1 Frontend ユニットテスト

- [ ] src/__tests__/stores/auth.spec.ts 作成
  - [ ] login テスト
  - [ ] logout テスト

- [ ] src/__tests__/stores/transaction.spec.ts 作成
  - [ ] fetchTransactions テスト
  - [ ] createTransaction テスト
  - [ ] deleteTransaction テスト

- [ ] src/__tests__/stores/analysis.spec.ts 作成
  - [ ] fetchMonthly テスト
  - [ ] fetchYearly テスト

### 5.2 GAS テスト

- [ ] manual test: Spreadsheet データの CRUD 確認
- [ ] manual test: API レスポンス形式の確認

### 5.3 Frontend ビルド最適化

- [ ] vite.config.ts を更新
  - [ ] rollupOptions で manualChunks 設定
  - [ ] chunkSizeWarningLimit 設定

- [ ] src/utils/performance.ts 作成
  - [ ] logPerformance() 関数

### 5.4 GitHub Actions ワークフロー

- [ ] .github/workflows/deploy-gas.yml 作成
  - [ ] clasp login
  - [ ] clasp push
  - [ ] エラーハンドリング

- [ ] .github/workflows/deploy-frontend.yml 作成
  - [ ] npm build
  - [ ] GitHub Pages へデプロイ

### 5.5 GitHub Pages 設定

- [ ] リポジトリ Settings → Pages で
  - [ ] Branch: main
  - [ ] Folder: /(root) → /frontend/dist に変更
  - [ ] デプロイ完了確認

### 5.6 本番環境チェック

- [ ] GitHub Secrets 設定確認
  - [ ] CLASP_TOKEN
  - [ ] GAS_SCRIPT_ID
  - [ ] GAS_PASSWORD（非公開）

- [ ] Google Spreadsheet 設定確認
  - [ ] Spreadsheet ID が GAS に設定
  - [ ] 初期データが投入済み

- [ ] GAS Web Apps 確認
  - [ ] デプロイURL が正しい
  - [ ] アクセス: 「全員」

- [ ] Frontend .env.local 確認
  - [ ] VITE_GAS_URL が正しい

### 5.7 全体統合テスト

- [ ] ログイン → すべてのページへアクセス可能
- [ ] 収支の登録・編集・削除
- [ ] 分析グラフの表示
- [ ] Spreadsheet データの確認
- [ ] GitHub Pages でのアプリ動作確認

### 5.8 ドキュメント更新

- [ ] README.md をリリース状況で更新
- [ ] 既知の問題を記載
- [ ] トラブルシューティング を追加

### 5.9 コミット & リリース

- [ ] Phase 5 の実装をコミット
  - commit message: `feat(phase5): add tests, optimize builds, setup ci/cd`

- [ ] タグ作成
  - [ ] git tag v1.0.0
  - [ ] git push origin v1.0.0

---

## 全フェーズ完了チェックリスト

- [ ] すべての Phase が完了
- [ ] すべてのテストが合格
- [ ] GitHub Actions で自動デプロイが動作
- [ ] GitHub Pages で本番アプリが公開中
- [ ] ドキュメントが完全
- [ ] 既知の問題がないか確認

---

## チェックリスト管理方法

### 各フェーズの進捗確認
```bash
# このファイルをエディタで開いて、完了したタスクの [ ] を [x] にマーク
# 例: - [x] Phase 1.1.1 プロジェクト初期化 完了
```

### コミット時の注意
各フェーズ完了時に、このファイルを更新してコミット

---

## 依存関係

```
Phase 1 (基盤整備)
  ↓
Phase 2 (Transaction CRUD) ← Phase 3 と並列可能
  ↓
Phase 4 (分析機能)
  ↓
Phase 5 (最適化・デプロイ)
```

**並列実装可能:**
- Phase 2 と Phase 3 は同時進行可能（GAS の API 実装）
- Phase 4 は Phase 2・3 の完了後に開始

---

## 環境変数チェックリスト

### Frontend (.env.local)
- [ ] VITE_GAS_URL の設定

### GAS (環境変数または GitHub Secrets)
- [ ] SPREADSHEET_ID の設定
- [ ] GAS_PASSWORD の設定

### GitHub Actions (GitHub Secrets)
- [ ] CLASP_TOKEN の登録
- [ ] GAS_SCRIPT_ID の登録

---

## 参考リンク

- [仕様書](specification.md)
- [API 仕様](api.md)
- [DB 設計](schema.md)
- [セットアップガイド](SETUP.md)

