/**
 * 当日评价统计——仅前端 localStorage，按日期自动重置。
 * key 固定为单条记录，不累积历史。
 */

/** 评价质量等级 */
export type CaptureQuality = 'good' | 'acceptable' | 'bad';

/** 每日统计结构 */
type DailyStats = {
  date: string;
  good: number;
  acceptable: number;
  bad: number;
};

const STORAGE_KEY = 'aionui_capture_stats';

/** 获取今日日期字符串（YYYY-MM-DD） */
function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 读取今日统计（日期不匹配则重置为零） */
export function getTodayStats(): DailyStats {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stats = JSON.parse(raw) as DailyStats;
      if (stats.date === today) return stats;
    }
  } catch {
    // ignore parse errors
  }
  return { date: today, good: 0, acceptable: 0, bad: 0 };
}

/** 记录一次评价提交，返回更新后的统计 */
export function recordCapture(quality: CaptureQuality): DailyStats {
  const stats = getTodayStats();
  stats[quality] += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}

/** 获取今日总提交次数 */
export function getTodayTotal(): number {
  const s = getTodayStats();
  return s.good + s.acceptable + s.bad;
}
