import type { ChartOptions } from 'chart.js';

// 型定義
export interface UrlStat {
  urlKey: string;
  url: string;
  count: number;
  sessions: string[];
  visitors?: string[];
  uniqueSessions?: number;
  uniqueVisitors?: number;
  lastUpdated?: unknown;
}

export interface DailyStatsData {
  summary: {
    date: string;
    totalCount: number;
    lastUpdated: unknown;
  } | null;
  urlStats: UrlStat[];
}

// ユーティリティ: 指定モードのIDを取得
function getIdsForMode(urlStat: UrlStat, mode: 'sessions' | 'visitors'): string[] {
  return mode === 'sessions' ? urlStat.sessions : (urlStat.visitors || []);
}

// ユーティリティ: 日別のユニークID数を計算
export function calculateDailyUniqueCount(day: DailyStatsData, mode: 'sessions' | 'visitors'): number {
  const uniqueIds = new Set<string>();
  day.urlStats?.forEach(urlStat => {
    getIdsForMode(urlStat, mode).forEach(id => uniqueIds.add(id));
  });
  return uniqueIds.size;
}

// ユーティリティ: 期間全体のユニークID数を計算
export function calculateTotalUniqueCount(rangeStats: DailyStatsData[], mode: 'sessions' | 'visitors'): number {
  const allIds = new Set<string>();
  rangeStats.forEach(day => {
    day.urlStats?.forEach(urlStat => {
      getIdsForMode(urlStat, mode).forEach(id => allIds.add(id));
    });
  });
  return allIds.size;
}

// 色を動的に生成
export function generateColors(count: number) {
  const baseColors = [
    { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
    { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
    { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
    { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
    { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
    { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' },
    { bg: 'rgba(199, 199, 199, 0.2)', border: 'rgba(199, 199, 199, 1)' },
    { bg: 'rgba(83, 102, 255, 0.2)', border: 'rgba(83, 102, 255, 1)' },
    { bg: 'rgba(255, 102, 146, 0.2)', border: 'rgba(255, 102, 146, 1)' },
    { bg: 'rgba(102, 255, 178, 0.2)', border: 'rgba(102, 255, 178, 1)' }
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    if (i < baseColors.length) {
      colors.push(baseColors[i]);
    } else {
      const hue = (i * 137.508) % 360;
      colors.push({
        bg: `hsla(${hue}, 70%, 60%, 0.2)`,
        border: `hsla(${hue}, 70%, 50%, 1)`
      });
    }
  }
  return colors;
}

// グラフオプション
export const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
};

// URL別統計を集計（モード不要 - 全データを集計）
export function aggregateUrlStats(rangeStats: DailyStatsData[]) {
  if (rangeStats.length === 0) {
    return [];
  }
  
  const urlMap = new Map<string, UrlStat>();
  
  rangeStats.forEach(day => {
    day.urlStats?.forEach((urlStat: UrlStat) => {
      const existing = urlMap.get(urlStat.urlKey);
      if (existing) {
        existing.count += urlStat.count;
        existing.sessions = [...new Set([...existing.sessions, ...urlStat.sessions])];
        existing.visitors = [...new Set([...(existing.visitors || []), ...(urlStat.visitors || [])])];
        existing.uniqueSessions = (existing.uniqueSessions || 0) + (urlStat.uniqueSessions || 0);
        existing.uniqueVisitors = (existing.uniqueVisitors || 0) + (urlStat.uniqueVisitors || 0);
      } else {
        urlMap.set(urlStat.urlKey, {
          urlKey: urlStat.urlKey,
          url: urlStat.url,
          count: urlStat.count,
          sessions: [...urlStat.sessions],
          visitors: urlStat.visitors ? [...urlStat.visitors] : [],
          uniqueSessions: urlStat.uniqueSessions,
          uniqueVisitors: urlStat.uniqueVisitors
        });
      }
    });
  });
  
  return Array.from(urlMap.values()).sort((a, b) => b.count - a.count);
}

// URL表示名を生成するヘルパー関数
function generateUrlDisplayLabel(url: string): string {
  if (url === '/') {
    return 'main';
  } else if (url.includes('?id:')) {
    // ?id:以降を抽出
    const match = url.match(/\?id:(.+)/);
    return match?.[1] ?? url;
  } else {
    return url;
  }
}

// ユニーク数を取得するヘルパー関数
function getUniqueCount(urlStat: UrlStat, mode: 'sessions' | 'visitors'): number {
  if (mode === 'visitors') {
    return urlStat.uniqueVisitors ?? (urlStat.visitors?.length || 0);
  } else {
    return urlStat.uniqueSessions ?? (urlStat.sessions?.length || 0);
  }
}

// 総計とURL別を統合したグラフデータ生成
export function generateCombinedChartData(rangeStats: DailyStatsData[], aggregatedUrls: UrlStat[], mode: 'sessions' | 'visitors' = 'sessions') {
  if (rangeStats.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = rangeStats.map(day => day.summary?.date || '');
  const colors = generateColors(aggregatedUrls.length + 1); // +1 for total line
  
  // 総計データセット
  const totalData = rangeStats.map(day => calculateDailyUniqueCount(day, mode));
  
  const totalDataset = {
    label: 'Total',
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgba(54, 162, 235, 1)',
    data: totalData,
    tension: 0.3,
    borderWidth: 3 // 総計を太線で強調
  };

  // URL別データセット
  const urlDatasets = aggregatedUrls.map((urlStat: UrlStat, index: number) => {
    const data = rangeStats.map(day => {
      const found = day.urlStats?.find((u: UrlStat) => u.urlKey === urlStat.urlKey);
      return found ? getUniqueCount(found, mode) : 0;
    });

    const color = colors[index + 1] ?? { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' };
    return {
      label: generateUrlDisplayLabel(urlStat.url),
      backgroundColor: color.bg,
      borderColor: color.border,
      data,
      tension: 0.3,
      borderWidth: 2
    };
  });

  return { labels, datasets: [totalDataset, ...urlDatasets] };
}
