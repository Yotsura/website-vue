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

// URL別統計を集計
export function aggregateUrlStats(rangeStats: DailyStatsData[], mode: 'sessions' | 'visitors' = 'sessions') {
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
        if (mode === 'visitors' && urlStat.visitors) {
          existing.visitors = [...new Set([...(existing.visitors || []), ...urlStat.visitors])];
        }
        if (urlStat.uniqueSessions !== undefined) {
          existing.uniqueSessions = (existing.uniqueSessions || 0) + urlStat.uniqueSessions;
        }
        if (urlStat.uniqueVisitors !== undefined) {
          existing.uniqueVisitors = (existing.uniqueVisitors || 0) + urlStat.uniqueVisitors;
        }
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

// 総計グラフデータ生成
export function generateTotalChartData(rangeStats: DailyStatsData[], mode: 'sessions' | 'visitors' = 'sessions') {
  if (rangeStats.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = rangeStats.map(day => day.summary?.date || '');
  const data = rangeStats.map(day => calculateDailyUniqueCount(day, mode));
  const label = mode === 'sessions' ? '総ユニークセッション数' : '総ユニークビジター数';

  return {
    labels,
    datasets: [
      {
        label: label,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        data,
        tension: 0.3
      }
    ]
  };
}

// URL別グラフデータ生成
export function generateUrlChartData(rangeStats: DailyStatsData[], aggregatedUrls: UrlStat[], mode: 'sessions' | 'visitors' = 'sessions') {
  if (rangeStats.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = rangeStats.map(day => day.summary?.date || '');
  const colors = generateColors(aggregatedUrls.length);

  const datasets = aggregatedUrls.map((urlStat: UrlStat, index: number) => {
    const data = rangeStats.map(day => {
      const found = day.urlStats?.find((u: UrlStat) => u.urlKey === urlStat.urlKey);
      if (!found) return 0;
      
      // モードに応じてユニーク数を返す
      if (mode === 'visitors') {
        return found.uniqueVisitors ?? (found.visitors?.length || 0);
      } else {
        return found.uniqueSessions ?? (found.sessions?.length || 0);
      }
    });

    const color = colors[index] ?? { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' };
    return {
      label: urlStat.url,
      backgroundColor: color.bg,
      borderColor: color.border,
      data,
      tension: 0.3
    };
  });

  return { labels, datasets };
}
