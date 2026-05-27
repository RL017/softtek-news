import type { NewsItem } from '../lib/types';

interface Category {
  value: string;
  label: string;
}

interface Props {
  news: NewsItem[];
  stats: {
    total: number;
    last7d: number;
    last30d: number;
    categoryCount: Record<string, number>;
    topSource: [string, number][];
  };
  categories: Category[];
}

const CATEGORY_COLORS: Record<string, string> = {
  bid:         'bg-green-500',
  product:     'bg-purple-500',
  cooperation: 'bg-blue-500',
  investment:  'bg-yellow-500',
  event:       'bg-orange-500',
  stock:       'bg-red-500',
  finance:     'bg-gray-400',
  brand:       'bg-indigo-500',
};

function getDailyTrend(news: NewsItem[]): { date: string; count: number }[] {
  const counts: Record<string, number> = {};
  news.forEach((n) => {
    counts[n.date] = (counts[n.date] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}

export default function StatsPanel({ news, stats, categories }: Props) {
  const categoryList = categories.filter(
    (c) => c.value !== 'all' && stats.categoryCount[c.value]
  );
  const dailyTrend = getDailyTrend(news);
  const maxCount = Math.max(...dailyTrend.map((d) => d.count), 1);
  const maxSource = stats.topSource[0]?.[1] || 1;

  // 只显示间隔标签，避免重叠
  const step = Math.ceil(dailyTrend.length / 8);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Daily trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-2">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
          <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
          新闻每日分布
        </h3>

        {/* Bar chart */}
        <div className="overflow-x-auto pr-1">
          {/* 数字行 + 柱子行 */}
          <div className="flex items-end gap-1.5" style={{ minHeight: '88px' }}>
            {dailyTrend.map(({ date, count }) => (
              <div key={date} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: '24px' }}>
                <span className="text-xs text-gray-500 font-medium leading-none">{count}</span>
                <div
                  className="w-4 rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-colors cursor-default"
                  style={{ height: `${Math.max(6, (count / maxCount) * 64)}px` }}
                  title={`${date}: ${count}篇`}
                />
              </div>
            ))}
          </div>
          {/* 日期标签行（独立一行，不影响柱子对齐） */}
          <div className="flex gap-1.5 mt-1">
            {dailyTrend.map(({ date }, idx) => (
              <div key={date} className="flex-shrink-0 text-center" style={{ minWidth: '24px' }}>
                {idx % step === 0 ? (
                  <span className="text-gray-400 leading-none" style={{ fontSize: '9px' }}>
                    {date.slice(5)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Category distribution */}
        <div className="mt-5 pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-medium mb-3">分类分布</p>
          <div className="space-y-2">
            {categoryList.map((cat) => {
              const count = stats.categoryCount[cat.value] || 0;
              const pct = Math.round((count / stats.total) * 100);
              return (
                <div key={cat.value} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_COLORS[cat.value] || 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-500 w-16 flex-shrink-0">{cat.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_COLORS[cat.value] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{count}篇</span>
                  <span className="text-xs text-gray-300 w-7 text-right flex-shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
          <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
          来源分布
        </h3>
        <div className="space-y-3">
          {stats.topSource.map(([source, count], i) => (
            <div key={source} className="flex items-center gap-2.5">
              <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-blue-600 text-white' :
                i === 1 ? 'bg-blue-400 text-white' :
                i === 2 ? 'bg-blue-200 text-blue-800' :
                'bg-gray-100 text-gray-400'
              }`} style={{ fontSize: '10px' }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{source}</p>
                <div className="bg-gray-100 rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-blue-300' : 'bg-blue-200'
                    }`}
                    style={{ width: `${Math.max(8, (count / maxSource) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-600 flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">共 {stats.topSource.length} 个来源</p>
        </div>
      </div>
    </div>
  );
}
