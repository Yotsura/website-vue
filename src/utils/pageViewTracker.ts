import { projectFirestore } from '@/firebase/config';
import firebase from 'firebase/compat/app';

// 設定
const CONFIG = {
  MAX_SESSION_ARRAY: 200,    // セッション配列の上限
  MAX_VISITOR_ARRAY: 100,    // ビジター配列の上限
  VISITOR_EXPIRE_DAYS: 30,   // ビジターIDの有効期限（日数）
  COUNT_COOLDOWN: 30         // 再カウント防止のクールダウン時間（秒）
};

/**
 * URLを正規化してキーを生成
 * ?id:パラメータがある場合のみパラメータを含め、それ以外は"main"にまとめる
 */
function normalizeUrl(): { urlKey: string; displayUrl: string } {
  const pathname = window.location.pathname;
  const search = window.location.search;
  const href = window.location.href;
  
  // ?id:パラメータがあるかチェック
  const hasIdParam = href.includes('?id:');
  
  // フルパスを表示用に保持
  const displayUrl = pathname + search;
  
  // ?id:パラメータがある場合のみそのまま、それ以外は"main"にまとめる
  const keyPath = hasIdParam ? displayUrl : 'main';
  
  // Firestoreのドキュメント名として使えるよう、特殊文字をエンコード
  const urlKey = encodeURIComponent(keyPath).replace(/%/g, '_');
  
  return { urlKey, displayUrl };
}

/**
 * 現在の日付をYYYY-MM-DD形式で取得（日本時間基準）
 */
function getDateKey(): string {
  // 日本時間（UTC+9）で日付を取得
  const now = new Date();
  const jstOffset = 9 * 60; // 日本時間のオフセット（分単位）
  const localOffset = now.getTimezoneOffset(); // ローカル時間のUTCからのオフセット（分単位、負の値）
  const jstTime = new Date(now.getTime() + (jstOffset + localOffset) * 60 * 1000);
  
  const year = jstTime.getFullYear();
  const month = String(jstTime.getMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * セッションIDを取得または生成（ブラウザを閉じるまで有効）
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('pageview_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('pageview_session_id', sessionId);
  }
  return sessionId;
}

/**
 * ビジターIDを取得または生成（30日間有効、ブラウザに永続保存）
 */
function getVisitorId(): string {
  const STORAGE_KEY = 'pageview_visitor_id';
  const CREATED_KEY = 'pageview_visitor_created';
  
  let visitorId = localStorage.getItem(STORAGE_KEY);
  const createdDate = localStorage.getItem(CREATED_KEY);
  
  // 有効期限チェック
  if (visitorId && createdDate) {
    const created = new Date(createdDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > CONFIG.VISITOR_EXPIRE_DAYS) {
      // 期限切れ：新しいIDを生成
      visitorId = null;
    }
  }
  
  // 新規ビジターIDを生成
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, visitorId);
    localStorage.setItem(CREATED_KEY, new Date().toISOString());
  }
  
  return visitorId;
}

/**
 * 最後にカウントした時刻をチェック（クールダウン機能）
 */
function checkCooldown(urlKey: string, dateKey: string): boolean {
  const storageKey = `pageview_last_${dateKey}_${urlKey}`;
  const lastCountTime = sessionStorage.getItem(storageKey);
  
  if (lastCountTime) {
    const elapsed = Date.now() - parseInt(lastCountTime);
    if (elapsed < CONFIG.COUNT_COOLDOWN * 1000) {
      return false; // クールダウン中
    }
  }
  
  return true; // カウント可能
}

/**
 * 最後のカウント時刻を記録
 */
function updateCooldown(urlKey: string, dateKey: string): void {
  const storageKey = `pageview_last_${dateKey}_${urlKey}`;
  sessionStorage.setItem(storageKey, Date.now().toString());
}

/**
 * セッション内で既にカウント済みかチェック
 */
function isAlreadyCounted(urlKey: string, dateKey: string): boolean {
  const storageKey = `pageview_${dateKey}_${urlKey}`;
  return sessionStorage.getItem(storageKey) === 'counted';
}

/**
 * セッション内でカウント済みとしてマーク
 */
function markAsCounted(urlKey: string, dateKey: string): void {
  const storageKey = `pageview_${dateKey}_${urlKey}`;
  sessionStorage.setItem(storageKey, 'counted');
}

/**
 * ページビューをFirestoreに記録
 * 構造: pageViews/{date} (サマリーはフィールド) + urls/{urlKey} (サブコレクション)
 * ユニークセッション数とユニークビジター数を追跡
 */
export async function trackPageView(): Promise<void> {
  try {
    const { urlKey, displayUrl } = normalizeUrl();
    const dateKey = getDateKey();
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    
    // 同じセッション内での二重カウントを防止
    if (isAlreadyCounted(urlKey, dateKey)) {
      console.log('[PageView] Already counted in this session');
      return;
    }
    
    // クールダウンチェック（30秒以内の再カウント防止）
    if (!checkCooldown(urlKey, dateKey)) {
      console.log('[PageView] Cooldown active');
      return;
    }
    
    // 現在のデータを取得して配列サイズをチェック
    const urlDocRef = projectFirestore
      .collection('pageViews')
      .doc(dateKey)
      .collection('urls')
      .doc(urlKey);
    
    const urlDoc = await urlDocRef.get();
    const currentData = urlDoc.data();
    
    const sessionArray = currentData?.sessions || [];
    const visitorArray = currentData?.visitors || [];
    
    // 新しいセッション/ビジターかチェック
    const isNewSession = !sessionArray.includes(sessionId);
    const isNewVisitor = !visitorArray.includes(visitorId);
    
    const batch = projectFirestore.batch();
    
    // URL別のカウント（サブコレクション）
    const updateData: {
      count: firebase.firestore.FieldValue;
      url: string;
      lastUpdated: firebase.firestore.FieldValue;
      sessions?: firebase.firestore.FieldValue;
      uniqueSessionCount?: firebase.firestore.FieldValue;
      visitors?: firebase.firestore.FieldValue;
      uniqueVisitorCount?: firebase.firestore.FieldValue;
    } = {
      count: firebase.firestore.FieldValue.increment(1),
      url: displayUrl,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // セッション配列の更新
    if (isNewSession) {
      if (sessionArray.length < CONFIG.MAX_SESSION_ARRAY) {
        // 配列に追加
        updateData.sessions = firebase.firestore.FieldValue.arrayUnion(sessionId);
        updateData.uniqueSessionCount = firebase.firestore.FieldValue.increment(1);
      } else {
        // 配列は更新せず、カウントのみ増加
        updateData.uniqueSessionCount = firebase.firestore.FieldValue.increment(1);
      }
    }
    
    // ビジター配列の更新
    if (isNewVisitor) {
      if (visitorArray.length < CONFIG.MAX_VISITOR_ARRAY) {
        // 配列に追加
        updateData.visitors = firebase.firestore.FieldValue.arrayUnion(visitorId);
        updateData.uniqueVisitorCount = firebase.firestore.FieldValue.increment(1);
      } else {
        // 配列は更新せず、カウントのみ増加
        updateData.uniqueVisitorCount = firebase.firestore.FieldValue.increment(1);
      }
    }
    
    batch.set(urlDocRef, updateData, { merge: true });
    
    // 日付ドキュメントのサマリーフィールド
    const dateDocRef = projectFirestore
      .collection('pageViews')
      .doc(dateKey);
    
    batch.set(
      dateDocRef,
      {
        totalCount: firebase.firestore.FieldValue.increment(1),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    
    await batch.commit();
    
    // セッション内でカウント済みとしてマーク
    markAsCounted(urlKey, dateKey);
    updateCooldown(urlKey, dateKey);
    
    console.log('[PageView] Tracked:', {
      url: displayUrl,
      date: dateKey,
      sessionId: sessionId,
      visitorId: visitorId,
      isNewSession,
      isNewVisitor
    });
  } catch (error) {
    console.error('[PageView] Failed to track:', error);
    // エラーが発生してもアプリの動作は継続
  }
}

/**
 * 特定日のアクセス統計を取得（管理画面用）
 */
export async function getDailyStats(date: string) {
  try {
    // 日付ドキュメントからサマリーを取得
    const dateDoc = await projectFirestore
      .collection('pageViews')
      .doc(date)
      .get();
    
    const dateData = dateDoc.data();
    const summary = dateDoc.exists && dateData ? {
      date: date,
      totalCount: dateData.totalCount || 0,
      lastUpdated: dateData.lastUpdated
    } : null;
    
    // URLサブコレクションを取得
    const urlsSnapshot = await projectFirestore
      .collection('pageViews')
      .doc(date)
      .collection('urls')
      .get();
    
    const urlStats = urlsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        urlKey: doc.id,
        url: data.url,
        count: data.count,
        sessions: data.sessions || [],
        visitors: data.visitors || [],
        uniqueSessions: data.uniqueSessionCount || (data.sessions || []).length,
        uniqueVisitors: data.uniqueVisitorCount || (data.visitors || []).length,
        lastUpdated: data.lastUpdated
      };
    });
    
    // カウント数で降順ソート
    urlStats.sort((a, b) => b.count - a.count);
    
    return {
      summary,
      urlStats
    };
  } catch (error) {
    console.error('[PageView] Failed to get daily stats:', error);
    return { summary: null, urlStats: [] };
  }
}

/**
 * 期間内の統計を取得（管理画面用）
 */
export async function getRangeStats(startDate: string, endDate: string) {
  try {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 日付のリストを生成
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    const allStats = [];
    for (const date of dates) {
      const stats = await getDailyStats(date);
      if (stats.summary) {
        allStats.push(stats);
      }
    }
    
    return allStats;
  } catch (error) {
    console.error('[PageView] Failed to get range stats:', error);
    return [];
  }
}

/**
 * 特定URLの統計を複数日にわたって取得（管理画面用）
 */
export async function getUrlStats(urlKey: string, startDate: string, endDate: string) {
  try {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 日付のリストを生成
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    const stats = [];
    for (const date of dates) {
      const docRef = projectFirestore
        .collection('pageViews')
        .doc(date)
        .collection('urls')
        .doc(urlKey);
      
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        stats.push({
          date: date,
          url: data?.url,
          count: data?.count || 0,
          sessions: data?.sessions || [],
          uniqueSessions: (data?.sessions || []).length,
          lastUpdated: data?.lastUpdated
        });
      }
    }
    
    return stats;
  } catch (error) {
    console.error('[PageView] Failed to get URL stats:', error);
    return [];
  }
}
