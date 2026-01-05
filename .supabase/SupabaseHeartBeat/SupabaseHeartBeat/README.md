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
- `lastRunDateLocal`: 最終実行日 (ローカル日付, `YYYY-MM-DD`)。同一日付であれば処理をスキップします（タスクスケジューラのログオン時重複などを防止）。

## 配布/実行（単一 exe 運用）
- ビルド済み exe と同じ階層に `supabase-heartbeat.json` と（必要なら）`supabase-heartbeat-state.json` を配置してください。
- `supabase-heartbeat-state.json` が無い場合は初回実行時に作成されます。
- タスクスケジューラ等で exe を直接呼び出してください（コマンド記載は省略）。

## 処理概要
1) 設定/環境変数を読み込み、Supabase クライアントを初期化
2) 状態ファイルの日付（ローカル）を見て当日実行済みならスキップ
3) `heartbeats` テーブルに `id` + UTC 時刻を Upsert
4) 状態ファイルに記録された前回のダミー画像を削除（存在する場合）
5) 1x1 PNG を新規アップロードし、そのパスと最終実行日を状態ファイルに保存

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

## タスクスケジューラ登録手順（例）
1) Windows「タスクスケジューラ」で「基本タスクの作成」を選択し、名前を付ける（例: SupabaseHeartbeat）。
2) トリガー
   - 「毎日」固定時刻を設定（例: 03:00）。
   - 追加で「ログオン時」トリガーを作成してもよい（同日重複はアプリ側で `lastRunDateUtc` によりスキップ）。
3) 操作
   - 「プログラムの開始」を選択。
   - プログラム/スクリプト: ビルド済み exe のフルパス。
   - 作業ディレクトリ: exe を置いたフォルダパス。
4) 条件/設定（任意）
   - AC 電源時のみ実行や失敗時再試行など、環境に合わせて調整。
5) exe と同じフォルダに `supabase-heartbeat.json` と（必要に応じて）`supabase-heartbeat-state.json` を配置。
6) テスト実行して、`supabase-heartbeat-state.json` に `lastRunDateUtc` が更新されることと、Supabase 側で heartbeat/ダミー画像の更新を確認。
