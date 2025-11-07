<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { getRangeStats } from '@/utils/pageViewTracker';
import {
  chartOptions,
  aggregateUrlStats,
  generateCombinedChartData,
  calculateTotalUniqueCount,
  type DailyStatsData
} from '@/utils/chartUtils';

// Chart.jsコンポーネントを動的インポート
const Line = defineAsyncComponent(async () => {
  const chartJS = await import('chart.js');
  const vueChartJS = await import('vue-chartjs');
  
  chartJS.Chart.register(
    chartJS.CategoryScale,
    chartJS.LinearScale,
    chartJS.PointElement,
    chartJS.LineElement,
    chartJS.Title,
    chartJS.Tooltip,
    chartJS.Legend
  );
  
  return vueChartJS.Line;
});

// リアクティブデータ
const loading = ref<boolean>(true);
const rangeStats = ref<DailyStatsData[]>([]);
const startDate = ref<string>('');
const endDate = ref<string>('');
const displayMode = ref<'sessions' | 'visitors'>('visitors');

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
const aggregatedUrlStats = computed(() => aggregateUrlStats(rangeStats.value));

// 累計ユニーク数の計算
const totalUniqueCount = computed(() => calculateTotalUniqueCount(rangeStats.value, displayMode.value));

// 統合グラフ用データ（Computed）
const combinedChartData = computed(() => generateCombinedChartData(rangeStats.value, aggregatedUrlStats.value, displayMode.value));

onMounted(() => fetchStats());
</script>

<template>
  <div class="page-view-stats">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>アクセス統計</h2>
      <div class="btn-group" role="group">
        <input type="radio" class="btn-check" name="displayMode" 
          id="modeSession" value="sessions" v-model="displayMode">
        <label class="btn btn-outline-primary btn-sm" for="modeSession">
          <i class="bi bi-window-stack"></i>
          <span class="d-none d-sm-inline ms-1">セッション</span>
        </label>
        
        <input type="radio" class="btn-check" name="displayMode" 
          id="modeVisitor" value="visitors" v-model="displayMode">
        <label class="btn btn-outline-primary btn-sm" for="modeVisitor">
          <i class="bi bi-people"></i>
          <span class="d-none d-sm-inline ms-1">ビジター</span>
        </label>
      </div>
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
            <small class="text-muted d-block">
              累計ユニーク{{ displayMode === 'sessions' ? 'セッション' : 'ビジター' }}数
            </small>
            <h3 class="mb-0">{{ totalUniqueCount }}</h3>
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
        <!-- 統合グラフ（総計 + URL別） -->
        <div class="card mb-4">
          <div class="card-body">
            <h4>ユニーク{{ displayMode === 'sessions' ? 'セッション' : 'ビジター' }}数の推移</h4>
            <div style="height: 400px;">
              <Line :data="combinedChartData" :options="chartOptions" />
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
