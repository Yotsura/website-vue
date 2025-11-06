<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getRangeStats } from '@/utils/pageViewTracker';
import { generateSampleData, deleteSampleData } from '@/utils/generateSampleData';
import { Line } from 'vue-chartjs';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.jsコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 型定義
interface UrlStat {
  urlKey: string;
  url: string;
  count: number;
  sessions: string[];
  uniqueSessions?: number;
  lastUpdated?: unknown;
}

interface DailyStatsData {
  summary: {
    date: string;
    totalCount: number;
    lastUpdated: unknown;
  } | null;
  urlStats: UrlStat[];
}

// リアクティブデータ
const loading = ref<boolean>(true);
const rangeStats = ref<DailyStatsData[]>([]);
const startDate = ref<string>('');
const endDate = ref<string>('');
const generatingSample = ref<boolean>(false);
const deletingSample = ref<boolean>(false);

// 初期化
const initializeDates = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  
  startDate.value = formatDate(thirtyDaysAgo);
  endDate.value = formatDate(today);
};

initializeDates();

// データ取得
const fetchStats = async () => {
  loading.value = true;
  
  try {
    rangeStats.value = await getRangeStats(startDate.value, endDate.value);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

// サンプルデータ操作
const handleGenerateSample = async () => {
  if (!confirm('30日分のサンプルデータを生成しますか？既存のデータに追加されます。')) {
    return;
  }
  
  generatingSample.value = true;
  const success = await generateSampleData(30);
  generatingSample.value = false;
  
  if (success) {
    alert('サンプルデータを生成しました！');
    await fetchStats();
  } else {
    alert('サンプルデータの生成に失敗しました。');
  }
};

const handleDeleteSample = async () => {
  if (!confirm('30日分のデータを削除しますか？この操作は取り消せません。')) {
    return;
  }
  
  deletingSample.value = true;
  const success = await deleteSampleData(30);
  deletingSample.value = false;
  
  if (success) {
    alert('データを削除しました。');
    await fetchStats();
  } else {
    alert('データの削除に失敗しました。');
  }
};

// 統計計算（Computed）
const totalStats = computed(() => {
  if (rangeStats.value.length === 0) {
    return { totalCount: 0, urlCount: 0 };
  }
  
  const total = rangeStats.value.reduce((sum, day) => sum + (day.summary?.totalCount || 0), 0);
  const allUrls = new Set<string>();
  
  rangeStats.value.forEach(day => {
    day.urlStats?.forEach((url: UrlStat) => allUrls.add(url.urlKey));
  });
  
  return {
    totalCount: total,
    urlCount: allUrls.size
  };
});

const aggregatedUrlStats = computed(() => {
  if (rangeStats.value.length === 0) {
    return [];
  }
  
  const urlMap = new Map<string, UrlStat>();
  
  rangeStats.value.forEach(day => {
    day.urlStats?.forEach((urlStat: UrlStat) => {
      const existing = urlMap.get(urlStat.urlKey);
      if (existing) {
        existing.count += urlStat.count;
        existing.sessions = [...new Set([...existing.sessions, ...urlStat.sessions])];
      } else {
        urlMap.set(urlStat.urlKey, {
          urlKey: urlStat.urlKey,
          url: urlStat.url,
          count: urlStat.count,
          sessions: [...urlStat.sessions]
        });
      }
    });
  });
  
  return Array.from(urlMap.values()).sort((a, b) => b.count - a.count);
});

// グラフ用データ（Computed）
const totalChartData = computed(() => {
  if (rangeStats.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = rangeStats.value.map(day => day.summary?.date || '');
  const data = rangeStats.value.map(day => day.summary?.totalCount || 0);

  return {
    labels,
    datasets: [
      {
        label: '総アクセス数',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        data,
        tension: 0.3
      }
    ]
  };
});

const urlChartData = computed(() => {
  if (rangeStats.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = rangeStats.value.map(day => day.summary?.date || '');
  const allUrls = aggregatedUrlStats.value;
  const colors = generateColors(allUrls.length);

  const datasets = allUrls.map((urlStat: UrlStat, index: number) => {
    const data = rangeStats.value.map(day => {
      const found = day.urlStats?.find((u: UrlStat) => u.urlKey === urlStat.urlKey);
      return found ? found.count : 0;
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
});

// ユーティリティ関数
function generateColors(count: number) {
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
const chartOptions: ChartOptions<'line'> = {
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

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="page-view-stats">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>アクセス統計</h2>
      <div class="btn-group" role="group">
        <button 
          type="button" 
          class="btn btn-sm btn-success"
          :disabled="generatingSample"
          @click="handleGenerateSample">
          {{ generatingSample ? '生成中...' : 'サンプルデータ生成' }}
        </button>
        <button 
          type="button" 
          class="btn btn-sm btn-danger"
          :disabled="deletingSample"
          @click="handleDeleteSample">
          {{ deletingSample ? '削除中...' : 'データ削除' }}
        </button>
      </div>
    </div>
    
    <!-- 集計期間設定 -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <label class="form-label me-2 mb-0">集計期間:</label>
            <input 
              type="date" 
              v-model="startDate" 
              @change="fetchStats"
              class="form-control form-control-sm d-inline-block me-2"
              style="width: auto;">
            <span>〜</span>
            <input 
              type="date" 
              v-model="endDate" 
              @change="fetchStats"
              class="form-control form-control-sm d-inline-block ms-2"
              style="width: auto;">
          </div>
          <div class="text-end">
            <small class="text-muted d-block">累計アクセス数</small>
            <h3 class="mb-0">{{ totalStats.totalCount }}</h3>
          </div>
        </div>
      </div>
    </div>
    
    <!-- グラフ表示エリア -->
    <div class="mb-4 position-relative">
      <!-- ローディング中のオーバーレイ -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <!-- グラフコンテンツ -->
      <div :class="{ 'content-loading': loading }">
        <!-- 総アクセス数グラフ -->
        <div class="card mb-4">
          <div class="card-body">
            <h4>総アクセス数の推移</h4>
            <div style="height: 300px;">
              <Line :data="totalChartData" :options="chartOptions" />
            </div>
          </div>
        </div>
        
        <!-- URL別グラフ -->
        <div class="card mb-4">
          <div class="card-body">
            <h4>URL別アクセス数の推移</h4>
            <div style="height: 300px;">
              <Line :data="urlChartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-view-stats {
  padding: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 0.25rem;
}

.content-loading {
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.card {
  margin-bottom: 1rem;
}

.display-4 {
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0.5rem 0;
}

code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}
</style>
