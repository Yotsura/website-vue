import { projectFirestore } from '@/firebase/config';
import firebase from 'firebase/compat/app';

/**
 * テスト用のサンプルデータを生成してFirestoreに保存
 */
export async function generateSampleData(days = 30) {
  try {
    console.log(`[SampleData] Generating ${days} days of sample data...`);
    
    const today = new Date();
    const urls = [
      'main', // パラメータなしのページをまとめたもの
      '/?id:work123',
      '/?id:work456',
      '/?id:work789',
      '/?id:work111',
      '/?id:work222'
    ];
    
    const batch = projectFirestore.batch();
    let batchCount = 0;
    const batches: firebase.firestore.WriteBatch[] = [batch];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      
      // 各URLのアクセス数をランダムに生成
      let dailyTotal = 0;
      
      for (const url of urls) {
        const urlKey = url === 'main' ? 'main' : encodeURIComponent(url).replace(/%/g, '_');
        // URLごとに異なる傾向を持たせる
        const baseCount = getBaseCount(url);
        const randomFactor = 0.5 + Math.random() * 1.5; // 50%～150%の変動
        const count = Math.floor(baseCount * randomFactor);
        dailyTotal += count;
        
        // セッションIDを生成
        const sessions = [];
        for (let j = 0; j < count; j++) {
          sessions.push(`${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${i}_${j}`);
        }
        
        const urlDocRef = projectFirestore
          .collection('pageViews')
          .doc(dateKey)
          .collection('urls')
          .doc(urlKey);
        
        let currentBatch = batches[batches.length - 1];
        if (!currentBatch) {
          currentBatch = projectFirestore.batch();
          batches.push(currentBatch);
        }
        
        currentBatch.set(urlDocRef, {
          count: count,
          url: url,
          sessions: sessions,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        batchCount++;
        
        // Firestoreのバッチは最大500件まで
        if (batchCount >= 450) {
          batches.push(projectFirestore.batch());
          batchCount = 0;
        }
      }
      
      // 日別サマリーを日付ドキュメントのフィールドとして保存
      const dateDocRef = projectFirestore
        .collection('pageViews')
        .doc(dateKey);
      
      let currentBatch = batches[batches.length - 1];
      if (!currentBatch) {
        currentBatch = projectFirestore.batch();
        batches.push(currentBatch);
      }
      
      currentBatch.set(dateDocRef, {
        totalCount: dailyTotal,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      batchCount++;
      
      if (batchCount >= 450) {
        batches.push(projectFirestore.batch());
        batchCount = 0;
      }
    }
    
    // すべてのバッチをコミット
    console.log(`[SampleData] Committing ${batches.length} batches...`);
    for (let i = 0; i < batches.length; i++) {
      const batchToCommit = batches[i];
      if (batchToCommit) {
        await batchToCommit.commit();
        console.log(`[SampleData] Batch ${i + 1}/${batches.length} committed`);
      }
    }
    
    console.log(`[SampleData] Successfully generated ${days} days of sample data!`);
    return true;
  } catch (error) {
    console.error('[SampleData] Failed to generate sample data:', error);
    return false;
  }
}

/**
 * サンプルデータを削除
 */
export async function deleteSampleData(days = 30) {
  try {
    console.log(`[SampleData] Deleting ${days} days of sample data...`);
    
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDate(date);
      
      // その日のすべてのURLデータを削除
      const urlsSnapshot = await projectFirestore
        .collection('pageViews')
        .doc(dateKey)
        .collection('urls')
        .get();
      
      const batch = projectFirestore.batch();
      
      // URLサブコレクションを削除
      urlsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // 日付ドキュメント自体も削除
      const dateDocRef = projectFirestore
        .collection('pageViews')
        .doc(dateKey);
      batch.delete(dateDocRef);
      
      await batch.commit();
      console.log(`[SampleData] Deleted data for ${dateKey}`);
    }
    
    console.log(`[SampleData] Successfully deleted ${days} days of sample data!`);
    return true;
  } catch (error) {
    console.error('[SampleData] Failed to delete sample data:', error);
    return false;
  }
}

// ヘルパー関数
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getBaseCount(url: string): number {
  // URLごとに異なるベースアクセス数を設定
  switch (url) {
    case 'main':
      return 50; // メインページ（パラメータなし）は多め
    case '/?id:work123':
      return 20;
    case '/?id:work456':
      return 15;
    case '/?id:work789':
      return 25;
    case '/?id:work111':
      return 18;
    case '/?id:work222':
      return 12;
    default:
      return 10;
  }
}
