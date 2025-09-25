import { createClient } from '@supabase/supabase-js'

// Supabase設定（環境変数から取得）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ストレージバケット名
export const STORAGE_BUCKET = 'images'