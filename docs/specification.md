# 家計簿管理アプリ - 全体仕様書

## 1. プロジェクト概要

### 1.1 プロジェクト名
Mollet（家計簿管理アプリ）

### 1.2 目的
個人・家族の収支管理と分析を行うための Web アプリケーション

### 1.3 対象ユーザー
- 複数ユーザー（2名以上対応）
- 共通パスワードでのアクセス

### 1.4 技術スタック

#### フロントエンド
- Vue 3 + TypeScript
- Vite（ビルドツール）
- Vuetify（UI コンポーネント）
- Chart.js + vue-chartjs（グラフ表示）
- Vue Router（ルーティング）
- Pinia（状態管理）
- Axios（HTTP 通信）
- Day.js（日付処理）
- Vee-validate（フォーム検証）
- ホスティング: GitHub Pages

#### バックエンド
- Google Apps Script（TypeScript）
- Google Spreadsheet（DB）
- clasp（CLI ツール）
- デプロイ: GitHub Actions

---

## 2. 機能要件

### 2.1 認証機能
- [ ] 共通パスワードによるログイン
- [ ] ログアウト機能
- [ ] セッション管理（ローカルストレージ）

### 2.2 収支管理
- [ ] 収支の新規登録（支出/収入の区別）
- [ ] 収支の編集
- [ ] 収支の削除
- [ ] 日付、金額、カテゴリ、利用者、メモ、店舗名で管理

### 2.3 集計・分析機能

#### 月別分析
- [ ] 月の総支出・総収入
- [ ] 月別の支出カテゴリ別割合（円グラフ）
- [ ] 月別の利用者別割合（円グラフ）

#### 年別分析
- [ ] 年の支出・収入の月次推移（棒グラフ）
- [ ] 月別ランキング表示

#### 利用者別分析
- [ ] 利用者ごとの月別支出
- [ ] 利用者ごとのカテゴリ別支出

### 2.4 データ管理
- [ ] カテゴリマスタの管理（親・子カテゴリ）
- [ ] 利用者マスタの管理

---

## 3. 非機能要件

### 3.1 パフォーマンス
- ページロード時間: 3 秒以内
- API レスポンス時間: 1 秒以内

### 3.2 セキュリティ
- パスワードはハッシュ化して GAS 側で管理
- HTTPS 通信
- CORS 対応

### 3.3 ユーザビリティ
- レスポンシブデザイン（PC・スマートフォン対応）
- 直感的な UI/UX

### 3.4 保守性
- TypeScript による型安全性
- テスト可能な設計
- ドキュメント完備

---

## 4. データモデル

詳細は `docs/schema.md` を参照

### 4.1 主要エンティティ
- **Transaction**: 収支データ
- **Category**: カテゴリマスタ
- **User**: 利用者マスタ

---

## 5. システムアーキテクチャ

```
┌─────────────────────────────────────────────────┐
│         Vue.js App (Frontend)                   │
│  - Vue 3 + TypeScript + Vuetify + Chart.js     │
│  - GitHub Pages ホスティング                    │
└──────────────┬──────────────────────────────────┘
               │ Axios (REST API)
               ▼
┌─────────────────────────────────────────────────┐
│    Google Apps Script (Backend)                 │
│  - TypeScript                                   │
│  - Web Apps として公開                          │
│  - REST API エンドポイント                      │
└──────────────┬──────────────────────────────────┘
               │ Spreadsheet API
               ▼
┌─────────────────────────────────────────────────┐
│    Google Spreadsheet (Database)                │
│  - Sheet1: transactions                         │
│  - Sheet2: categories                           │
│  - Sheet3: users                                │
└─────────────────────────────────────────────────┘
```

---

## 6. ディレクトリ構成

```
mollet/
├── frontend/                 # Vue.js アプリ
│   ├── src/
│   │   ├── components/       # Vue コンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── stores/          # Pinia ストア
│   │   ├── api/             # API 通信
│   │   ├── types/           # TypeScript 型定義
│   │   ├── utils/           # ユーティリティ
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── gas/                      # Google Apps Script
│   ├── src/
│   │   ├── main.ts          # エントリーポイント
│   │   ├── handlers/        # API ハンドラー
│   │   ├── services/        # ビジネスロジック
│   │   ├── types/           # TypeScript 型定義
│   │   └── utils/           # ユーティリティ
│   ├── appsscript.json
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── specification.md      # この仕様書
│   ├── api.md               # API 仕様
│   ├── schema.md            # DB 設計
│   └── SETUP.md             # セットアップガイド
│
├── .github/workflows/       # GitHub Actions
│   ├── deploy-gas.yml       # GAS デプロイ
│   └── deploy-frontend.yml  # Frontend デプロイ
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 7. 開発フロー

### 7.1 ローカル開発
```bash
# Frontend
cd frontend
npm install
npm run dev

# Gas (別ターミナル)
cd gas
npm install
npm run build
```

### 7.2 デプロイ
- Frontend: main ブランチに push → GitHub Actions で GitHub Pages に自動デプロイ
- GAS: main ブランチに push → GitHub Actions で clasp で自動デプロイ

---

## 8. 環境変数

### 8.1 Frontend (.env.local)
```
VITE_GAS_URL=https://script.google.com/macros/d/{SCRIPT_ID}/usercallback
```

### 8.2 GitHub Secrets
- `CLASP_TOKEN`: clasp 認証トークン
- `GAS_SCRIPT_ID`: Google Apps Script ID
- `GAS_PASSWORD`: ログイン用共通パスワード

---

## 9. テスト戦略

- フロントエンド: Vitest + Vue Test Utils
- バックエンド: GAS 用テストフレームワーク

---

## 10. デプロイメント

### 10.1 本番環境への手順
1. Feature ブランチで開発
2. Pull Request で レビュー
3. main ブランチにマージ
4. GitHub Actions で自動デプロイ
5. GitHub Pages / GAS に反映

---

## 11. スケジュール

TBD（別途協議）

---

## 12. 参考資料

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Vue 3 公式ドキュメント](https://vuejs.org/)
- [Vuetify 公式ドキュメント](https://vuetifyjs.com/)
- [Chart.js 公式ドキュメント](https://www.chartjs.org/)

