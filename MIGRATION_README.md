# Firebase to Supabase Storage Migration Tool

このツールはFirebase StorageからSupabase Storageへの画像ファイル移行を自動化します。

## 機能

- Firebase Storage内の全ファイルを自動検出
- 同じフォルダ構造でSupabase Storageに移行
- 進捗表示とエラーハンドリング
- レート制限による安全な転送
- 既存ファイルの上書き対応

## 前提条件

- Node.js v14以上
- Firebase プロジェクトへのアクセス権
- Supabase プロジェクトの作成済み

## セットアップ

### 1. 依存関係のインストール

```bash
npm install firebase @supabase/supabase-js node-fetch dotenv
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Firebase設定の更新

`migrate-firebase-to-supabase.mjs` ファイル内の `firebaseConfig` を更新：

```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id"
}
```

### 4. Supabase Storage設定

Supabaseダッシュボードで：

1. Storage → Create bucket → `images` (またはお好みの名前)
2. Bucket を Public に設定
3. 必要に応じてStorage Policiesを設定

## 設定オプション

`MIGRATION_CONFIG` オブジェクトで動作をカスタマイズできます：

```javascript
const MIGRATION_CONFIG = {
  // Firebase Storage内のソースフォルダ
  FIREBASE_SOURCE_FOLDER: 'img',
  
  // Supabase Storageのバケット名
  SUPABASE_BUCKET: 'images',
  
  // ファイル転送間隔（ミリ秒）
  RATE_LIMIT_MS: 200,
  
  // ファイルのContent-Type
  CONTENT_TYPE: 'image/jpeg'
}
```

## 実行方法

```bash
node migrate-firebase-to-supabase.mjs
```

## 実行例

```
🚀 Starting Firebase to Supabase migration...
🔍 Listing Firebase Storage files in 'img' folder...
📁 Checking folder: works
📄 Found: img/works/image1.jpg
📄 Found: img/works/image1_large.jpg
...
✅ Total files found: 76
📋 Found 76 files to migrate

[1/76] Processing: img/works/image1.jpg
📤 Migrating: img/works/image1.jpg
📦 Downloaded 28834 bytes
✅ Successfully migrated: img/works/image1.jpg
...

🎉 Migration completed!
✅ Success: 76
❌ Failed: 0
```

## トラブルシューティング

### 権限エラー
- Firebase プロジェクトの権限を確認
- Supabase の Storage policies を確認

### ネットワークエラー
- インターネット接続を確認
- レート制限設定を調整（`RATE_LIMIT_MS`を増加）

### ファイルが見つからない
- Firebase Storage の実際のフォルダ構造を確認
- `FIREBASE_SOURCE_FOLDER` 設定を調整

## 注意事項

- 大量のファイルがある場合は時間がかかります
- 既存のSupabaseファイルは上書きされます
- 実行前にバックアップを推奨します

## ライセンス

MIT License - 自由にご利用ください。