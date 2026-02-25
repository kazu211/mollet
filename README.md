# Mollet - 家計簿管理アプリ

個人・家族の収支管理と分析を行うための Web アプリケーションです。

## 🚀 技術スタック

### フロントエンド
- Vue 3 + TypeScript
- Vite（ビルドツール）
- Vuetify（UI コンポーネント）
- Chart.js + vue-chartjs（グラフ表示）
- Vue Router（ルーティング）
- Pinia（状態管理）
- Axios（HTTP 通信）
- Day.js（日付処理）

### バックエンド
- Google Apps Script（TypeScript）
- Google Spreadsheet（DB）

## 📁 プロジェクト構成

```
mollet/
├── frontend/          # Vue.js フロントエンド
├── gas/               # Google Apps Script バックエンド
└── docs/              # ドキュメント
```

## 🛠️ セットアップ

### 前提条件
- Node.js 20.19+ または 22.12+
- npm
- Google アカウント（GAS用）

### フロントエンド

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local の VITE_GAS_URL を設定

# 開発サーバー起動
npm run dev
```

### GAS（Google Apps Script）

```bash
cd gas
npm install

# ビルド
npm run build
```

#### GAS デプロイ手順

1. [Google Apps Script](https://script.google.com/) で新規プロジェクト作成
2. `gas/dist/main.js` の内容をコピー＆ペースト
3. `gas/appsscript.json` の内容で appsscript.json を更新
4. Script Properties に以下を設定:
   - `GAS_PASSWORD`: 認証用パスワード
   - `SPREADSHEET_ID`: Google Spreadsheet のID（Phase 2以降）
5. デプロイ → 新しいデプロイ → ウェブアプリ
6. 取得したURLを frontend の `.env.local` に設定

## 📖 ドキュメント

- [仕様書](docs/specification.md)
- [API 仕様](docs/api.md)
- [DB 設計](docs/schema.md)
- [開発ガイド](docs/DEVELOPMENT.md)
- [進捗管理](docs/PROGRESS.md)

## ✅ 実装状況

- [x] **Phase 1**: 基盤整備（ログイン → ダッシュボード表示）
- [ ] **Phase 2**: Transaction CRUD
- [ ] **Phase 3**: マスタデータ管理
- [ ] **Phase 4**: 分析機能
- [ ] **Phase 5**: 最適化・デプロイ

## 📝 ライセンス

MIT License

