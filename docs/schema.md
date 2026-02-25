# データベース設計書

## 1. Google Spreadsheet 構成

合計3つのシート（Worksheet）で構成します。

---

## 2. Sheet1: transactions（収支データ）

### 2.1 目的
すべての収支データを管理

### 2.2 カラム定義

| # | カラム名 | 型 | 必須 | 説明 |
|----|---------|-----|-----|------|
| A | id | number | ○ | 一意のID（自動採番） |
| B | date | string | ○ | 日付（YYYY-MM-DD形式） |
| C | type | string | ○ | 種類（expense: 支出, income: 収入） |
| D | amount | number | ○ | 金額 |
| E | categoryId | number | ○ | カテゴリID（categories シートの id と関連） |
| F | userId | number | ○ | ユーザーID（users シートの id と関連） |
| G | shopName | string | △ | 店舗名（オプション） |
| H | memo | string | △ | メモ（オプション） |
| I | createdAt | string | ○ | 作成日時（ISO 8601形式） |
| J | updatedAt | string | ○ | 更新日時（ISO 8601形式） |

### 2.3 データ例

```
id  | date       | type    | amount | categoryId | userId | shopName    | memo              | createdAt                   | updatedAt
1   | 2026-02-01 | expense | 5000   | 5          | 1      | スーパー    | 食材購入           | 2026-02-01T10:00:00.000Z   | 2026-02-01T10:00:00.000Z
2   | 2026-02-02 | expense | 3000   | 12         | 2      | ガソリンスタンド | ガソリン        | 2026-02-02T11:00:00.000Z   | 2026-02-02T11:00:00.000Z
3   | 2026-02-03 | income  | 200000 | 1          | 1      |             | 給与              | 2026-02-03T09:00:00.000Z   | 2026-02-03T09:00:00.000Z
```

### 2.4 インデックス
- date（検索・ソート用）
- userId（ユーザー別検索）
- categoryId（カテゴリ別検索）
- type（収支タイプ検索）

---

## 3. Sheet2: categories（カテゴリマスタ）

### 3.1 目的
カテゴリの親・子関係を管理

### 3.2 カラム定義

| # | カラム名 | 型 | 必須 | 説明 |
|----|---------|-----|-----|------|
| A | id | number | ○ | 一意のID |
| B | name | string | ○ | カテゴリ名 |
| C | type | string | ○ | 種類（income: 収入, expense: 支出） |
| D | parentId | number | △ | 親カテゴリID（親カテゴリの場合は NULL） |
| E | displayOrder | number | ○ | 表示順序 |

### 3.3 データ例

#### 収入カテゴリ
```
id | name         | type   | parentId | displayOrder
1  | 給与         | income | NULL     | 10
2  | 給与         | income | 1        | 11
3  | 経費         | income | 1        | 12
4  | 特別収入     | income | NULL     | 20
5  | 預金金利     | income | 4        | 21
6  | 配当金       | income | 4        | 22
7  | その他       | income | 4        | 23
```

#### 支出カテゴリ
```
id | name         | type     | parentId | displayOrder
8  | 住宅費       | expense  | NULL     | 30
9  | 家賃         | expense  | 8        | 31
10 | 住宅ローン   | expense  | 8        | 32
11 | 管理修繕費   | expense  | 8        | 33
12 | 光熱費       | expense  | 8        | 34
13 | 通信         | expense  | 8        | 35
14 | 交通         | expense  | 8        | 36
15 | 奨学金       | expense  | 8        | 37
16 | 食費         | expense  | NULL     | 40
17 | 食費         | expense  | 16       | 41
18 | 外食         | expense  | 16       | 42
19 | 生活費       | expense  | NULL     | 50
20 | 日用品       | expense  | 19       | 51
21 | 衣服         | expense  | 19       | 52
22 | 美容         | expense  | 19       | 53
23 | 医療         | expense  | 19       | 54
24 | 娯楽費       | expense  | NULL     | 60
25 | 趣味         | expense  | 24       | 61
26 | 旅行         | expense  | 24       | 62
27 | 交際         | expense  | 24       | 63
28 | プレゼント   | expense  | 24       | 64
29 | 特別支出     | expense  | NULL     | 70
30 | ふるさと納税 | expense  | 29       | 71
31 | 家具家電     | expense  | 29       | 72
32 | その他       | expense  | 29       | 73
```

### 3.4 インデックス
- type（収入/支出で分類）
- parentId（親カテゴリ検索）

---

## 4. Sheet3: users（ユーザーマスタ）

### 4.1 目的
利用者情報を管理

### 4.2 カラム定義

| # | カラム名 | 型 | 必須 | 説明 |
|----|---------|-----|-----|------|
| A | id | number | ○ | 一意のID |
| B | name | string | ○ | ユーザー名 |
| C | displayOrder | number | ○ | 表示順序 |

### 4.3 データ例

```
id | name     | displayOrder
1  | User A   | 10
2  | User B   | 20
```

### 4.4 インデックス
- なし（データ数が少ないため）

---

## 5. リレーション図

```
transactions
├─ categoryId → categories.id（多対一）
└─ userId → users.id（多対一）

categories
└─ parentId → categories.id（自己参照・多対一）
```

---

## 6. データ整合性

### 6.1 制約
- transactions の categoryId は必ず categories.id に存在する
- transactions の userId は必ず users.id に存在する
- categories の parentId は NULL または categories.id に存在する

### 6.2 削除ポリシー
- categories の削除時: 関連する transactions も削除
- users の削除時: 関連する transactions も削除
  
※GAS で削除ロジック実装時に注意

---

## 7. 初期データセット

### 7.1 categories の初期化
```
収入:
- 給与（親）
  - 給与（子）
  - 経費（子）
- 特別収入（親）
  - 預金金利（子）
  - 配当金（子）
  - その他（子）

支出:
- 住宅費（親）
  - 家賃（子）
  - 住宅ローン（子）
  - 管理修繕費（子）
  - 光熱費（子）
  - 通信（子）
  - 交通（子）
  - 奨学金（子）
- 食費（親）
  - 食費（子）
  - 外食（子）
- 生活費（親）
  - 日用品（子）
  - 衣服（子）
  - 美容（子）
  - 医療（子）
- 娯楽費（親）
  - 趣味（子）
  - 旅行（子）
  - 交際（子）
  - プレゼント（子）
- 特別支出（親）
  - ふるさと納税（子）
  - 家具家電（子）
  - その他（子）
```

### 7.2 users の初期化
```
- User A
- User B
```

---

## 8. パフォーマンス考慮事項

### 8.1 データ量
- 月50件の transactions
- 年600件程度（6年で3600件）
- 管理可能な量

### 8.2 最適化
- 日付範囲で検索する際は date カラムでフィルタリング
- ユーザー別検索時は userId でフィルタリング
- カテゴリ別検索時は categoryId でフィルタリング

---

## 9. バージョン管理

**version 1.0: 初版**
- 2026-02-25 作成

### 変更予定
なし（現在の仕様で十分）

---

## 10. 補足

### 10.1 Google Spreadsheet のセットアップ
1. 新規スプレッドシート作成
2. Sheet1 → Sheet3 にリネーム（transactions, categories, users）
3. 各シートにヘッダー行を追加
4. categories と users に初期データを投入
5. GAS に Spreadsheet ID を設定

### 10.2 データ型の注意
- Google Spreadsheet では全て文字列で保存される
- GAS 側で JSON に変換時にデータ型をキャストする

