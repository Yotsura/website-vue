<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getRangeStats } from '@/utils/pageViewTracker';
import { Line } from 'vue-chartjs';
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
import {
  chartOptions,
  calculateTotalStats,
  aggregateUrlStats,
  generateTotalChartData,
  generateUrlChartData,
  type DailyStatsData
} from '@/utils/chartUtils';

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

// リアクティブデータ
const loading = ref<boolean>(true);
const rangeStats = ref<DailyStatsData[]>([]);
const startDate = ref<string>('');
const endDate = ref<string>('');

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

// 統計計算（Computed）
const totalStats = computed(() => calculateTotalStats(rangeStats.value));
const aggregatedUrlStats = computed(() => aggregateUrlStats(rangeStats.value));

// グラフ用データ（Computed）
const totalChartData = computed(() => generateTotalChartData(rangeStats.value));
const urlChartData = computed(() => generateUrlChartData(rangeStats.value, aggregatedUrlStats.value));

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="page-view-stats">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>アクセス統計</h2>
      <!-- テスト機能は一時的に無効化
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
      -->
    </div>
    
    <!-- 集計期間設定 -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
          <div class="w-100 w-sm-auto">
            <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
              <div class="d-flex align-items-center gap-2">
                <label class="form-label mb-0 text-nowrap">START:</label>
                <input 
                  type="date" 
                  v-model="startDate" 
                  @change="fetchStats"
                  class="form-control form-control-sm"
                  style="max-width: 150px;">
              </div>
              <div class="d-flex align-items-center gap-2">
                <label class="form-label mb-0 text-nowrap">END:</label>
                <input 
                  type="date" 
                  v-model="endDate" 
                  @change="fetchStats"
                  class="form-control form-control-sm"
                  style="max-width: 150px;">
              </div>
            </div>
          </div>
          <div class="w-100 w-sm-auto text-start text-sm-end">
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
