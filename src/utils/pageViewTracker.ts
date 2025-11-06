import { projectFirestore } from '@/firebase/config';
import firebase from 'firebase/compat/app';

/**
 * URLを正規化してキーを生成
 * パラメータも含めてユニークなキーにする
 */
function normalizeUrl(): string {
  const pathname = window.location.pathname;
  const search = window.location.search;
  
  // パラメータがある場合は含める
  const fullPath = pathname + search;
  
  // Firestoreのドキュメント名として使えるよう、特殊文字をエンコード
  return encodeURIComponent(fullPath).replace(/%/g, '_');
}

/**
 * 現在の日付をYYYY-MM-DD形式で取得
 */
function getDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * セッションIDを取得または生成
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('pageview_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('pageview_session_id', sessionId);
  }
  return sessionId;
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
 * 構造: pageViews/{date}/{urlKey}
 */
export async function trackPageView(): Promise<void> {
  try {
    const urlKey = normalizeUrl();
    const dateKey = getDateKey();
    const sessionId = getSessionId();
    const fullUrl = window.location.pathname + window.location.search;
    
    // 同じセッション内での二重カウントを防止
    if (isAlreadyCounted(urlKey, dateKey)) {
      console.log('[PageView] Already counted in this session');
      return;
    }
    
    const batch = projectFirestore.batch();
    
    // URL別のカウント
    const urlDocRef = projectFirestore
      .collection('pageViews')
      .doc(dateKey)
      .collection('urls')
      .doc(urlKey);
    
    batch.set(
      urlDocRef,
      {
        count: firebase.firestore.FieldValue.increment(1),
        url: fullUrl,
        sessions: firebase.firestore.FieldValue.arrayUnion(sessionId),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    
    // 日付ごとの全体サマリー
    const summaryDocRef = projectFirestore
      .collection('pageViews')
      .doc(dateKey)
      .collection('urls')
      .doc('_summary');
    
    batch.set(
      summaryDocRef,
      {
        totalCount: firebase.firestore.FieldValue.increment(1),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    
    await batch.commit();
    
    // セッション内でカウント済みとしてマーク
    markAsCounted(urlKey, dateKey);
    
    console.log('[PageView] Tracked:', {
      url: fullUrl,
      date: dateKey,
      sessionId: sessionId
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
    const snapshot = await projectFirestore
      .collection('pageViews')
      .doc(date)
      .collection('urls')
      .get();
    
    let summary = null;
    const urlStats = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (doc.id === '_summary') {
        summary = {
          date: date,
          totalCount: data.totalCount,
          lastUpdated: data.lastUpdated
        };
      } else {
        urlStats.push({
          urlKey: doc.id,
          url: data.url,
          count: data.count,
          sessions: data.sessions || [],
          uniqueSessions: (data.sessions || []).length,
          lastUpdated: data.lastUpdated
        });
      }
    }
    
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
