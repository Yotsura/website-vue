# Supabase Heartbeat Utility

Supabase のアイドル判定回避用に、DB ハートビート + ストレージのダミー画像アップロード/削除を行う .NET 9 コンソールアプリ（単一 exe 配布想定）です。

## 必要環境
- .NET Runtime 9.0 以降（自己完結型 publish の場合は不要）
- Supabase プロジェクト（`heartbeats` テーブルとストレージバケット）

## セットアップ
1) サンプル JSON をコピーして実値を設定
   - `supabase-heartbeat.sample.json` → `supabase-heartbeat.json`
   - `supabase-heartbeat-state.sample.json` → `supabase-heartbeat-state.json`（空でも可）
2) ファイルのビルドアクションを `Content`、出力ディレクトリへのコピーを `Copy if newer` に設定
3) 必要なら環境変数でも上書き可能
   - `SUPABASE_URL`, `SUPABASE_KEY`

### 設定項目（supabase-heartbeat.json）
- `url`: Supabase プロジェクト URL
- `key`: service role など、ストレージ delete/insert が可能なキー
- `clientId`: ハートビートの ID（省略時はマシン名）
- `bucket`: アップロード対象バケット名（既定 `images`）
- `objectPrefix`: オブジェクト保存プレフィックス（既定 `heartbeat`）

### 状態ファイル（supabase-heartbeat-state.json）
- `lastObjectPath`: 前回アップロードしたオブジェクトパス。存在すれば次回起動時に削除してから新規アップロードします。

## 配布/実行（単一 exe 運用）
- ビルド済み exe と同じ階層に `supabase-heartbeat.json` と（必要なら）`supabase-heartbeat-state.json` を配置してください。
- `supabase-heartbeat-state.json` が無い場合は初回実行時に作成されます。
- タスクスケジューラ等で exe を直接呼び出してください（コマンド記載は省略）。

## 処理概要
1) 設定/環境変数を読み込み、Supabase クライアントを初期化
2) `heartbeats` テーブルに `id` + UTC 時刻を Upsert
3) 状態ファイルに記録された前回のダミー画像を削除（存在する場合）
4) 1x1 PNG を新規アップロードし、そのパスを状態ファイルに保存

## スキーマ例
```sql
create table heartbeats (
  id text primary key,
  pinged_at timestamptz not null
);
```
バケットは事前に作成しておいてください（既定は `images`）。

## 運用メモ
- タスクスケジューラ等で定期実行する場合、JSON ではなく環境変数でキーを渡すと安全です。
- service role キーを使う場合は可視性に注意し、配布物には含めないでください。
- バケットがプライベートの場合、削除/アップロードが許可されるようストレージポリシーを調整してください。
