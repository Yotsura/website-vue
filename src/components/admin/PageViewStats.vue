<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getDailyStats, getRangeStats } from '@/utils/pageViewTracker';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface UrlStat {
  urlKey: string;
  url: string;
  count: number;
  sessions: string[];
  uniqueSessions?: number;
  lastUpdated?: any;
}

interface DailyStatsData {
  summary: {
    date: string;
    totalCount: number;
    lastUpdated: any;
  } | null;
  urlStats: UrlStat[];
}

const viewMode = ref<ViewMode>('daily');
const selectedDate = ref<string>('');
const loading = ref<boolean>(false);
const dailyStats = ref<DailyStatsData | null>(null);
const rangeStats = ref<DailyStatsData[]>([]);

// 今日の日付を初期値に
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
selectedDate.value = `${year}-${month}-${day}`;

// 日付範囲を計算
const getDateRange = (date: string, mode: ViewMode) => {
  const d = new Date(date);
  let start = '';
  let end = '';
  
  switch (mode) {
    case 'daily':
      start = end = date;
      break;
    case 'weekly': {
      // 選択した日を含む週（日曜始まり）
      const dayOfWeek = d.getDay();
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      start = formatDate(startOfWeek);
      end = formatDate(endOfWeek);
      break;
    }
    case 'monthly': {
      start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      break;
    }
    case 'yearly':
      start = `${d.getFullYear()}-01-01`;
      end = `${d.getFullYear()}-12-31`;
      break;
  }
  
  return { start, end };
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 統計を取得
const fetchStats = async () => {
  loading.value = true;
  
  try {
    if (viewMode.value === 'daily') {
      dailyStats.value = await getDailyStats(selectedDate.value);
    } else {
      const { start, end } = getDateRange(selectedDate.value, viewMode.value);
      rangeStats.value = await getRangeStats(start, end);
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

// 累計計算
const totalStats = computed(() => {
  if (viewMode.value === 'daily' && dailyStats.value) {
    return {
      totalCount: dailyStats.value.summary?.totalCount || 0,
      urlCount: dailyStats.value.urlStats?.length || 0
    };
  } else if (rangeStats.value.length > 0) {
    const total = rangeStats.value.reduce((sum, day) => sum + (day.summary?.totalCount || 0), 0);
    const allUrls = new Set();
    rangeStats.value.forEach(day => {
      day.urlStats?.forEach((url: UrlStat) => allUrls.add(url.urlKey));
    });
    return {
      totalCount: total,
      urlCount: allUrls.size
    };
  }
  return { totalCount: 0, urlCount: 0 };
});

// URL統計を集計
const aggregatedUrlStats = computed(() => {
  if (viewMode.value === 'daily' && dailyStats.value) {
    return dailyStats.value.urlStats || [];
  } else if (rangeStats.value.length > 0) {
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
  }
  return [];
});

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="page-view-stats">
    <h2>アクセス統計</h2>
    
    <!-- 表示モード切り替え -->
    <div class="mb-3">
      <div class="btn-group" role="group">
        <button 
          type="button" 
          class="btn btn-sm"
          :class="viewMode === 'daily' ? 'btn-primary' : 'btn-outline-primary'"
          @click="viewMode = 'daily'; fetchStats()">
          日別
        </button>
        <button 
          type="button" 
          class="btn btn-sm"
          :class="viewMode === 'weekly' ? 'btn-primary' : 'btn-outline-primary'"
          @click="viewMode = 'weekly'; fetchStats()">
          週別
        </button>
        <button 
          type="button" 
          class="btn btn-sm"
          :class="viewMode === 'monthly' ? 'btn-primary' : 'btn-outline-primary'"
          @click="viewMode = 'monthly'; fetchStats()">
          月別
        </button>
        <button 
          type="button" 
          class="btn btn-sm"
          :class="viewMode === 'yearly' ? 'btn-primary' : 'btn-outline-primary'"
          @click="viewMode = 'yearly'; fetchStats()">
          年別
        </button>
      </div>
      
      <input 
        type="date" 
        v-model="selectedDate" 
        @change="fetchStats"
        class="form-control form-control-sm d-inline-block ms-3"
        style="width: auto;">
    </div>
    
    <!-- ローディング -->
    <div v-if="loading" class="text-center p-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <!-- 累計統計 -->
    <div v-else class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">累計アクセス数</h5>
            <p class="display-4">{{ totalStats.totalCount }}</p>
            <small class="text-muted">
              期間: 
              <span v-if="viewMode === 'daily'">{{ selectedDate }}</span>
              <span v-else>{{ getDateRange(selectedDate, viewMode).start }} ~ {{ getDateRange(selectedDate, viewMode).end }}</span>
            </small>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">ユニークURL数</h5>
            <p class="display-4">{{ totalStats.urlCount }}</p>
            <small class="text-muted">異なるURLへのアクセス</small>
          </div>
        </div>
      </div>
    </div>
    
    <!-- URL別統計 -->
    <div v-if="!loading" class="mb-4">
      <h4>URL別アクセス数</h4>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>URL</th>
              <th>アクセス数</th>
              <th>ユニークセッション</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stat, index) in aggregatedUrlStats" :key="stat.urlKey">
              <td>{{ index + 1 }}</td>
              <td><code>{{ stat.url }}</code></td>
              <td><strong>{{ stat.count }}</strong></td>
              <td>{{ stat.sessions?.length || 0 }}</td>
            </tr>
            <tr v-if="aggregatedUrlStats.length === 0">
              <td colspan="4" class="text-center text-muted">データがありません</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 日別詳細（週/月/年表示時） -->
    <div v-if="!loading && viewMode !== 'daily' && rangeStats.length > 0" class="mb-4">
      <h4>日別詳細</h4>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>日付</th>
              <th>アクセス数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in rangeStats" :key="day.summary?.date">
              <td>{{ day.summary?.date }}</td>
              <td>{{ day.summary?.totalCount || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-view-stats {
  padding: 1rem;
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
