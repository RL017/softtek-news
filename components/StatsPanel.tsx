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
  bid: 'bg-green-500',
  product: 'bg-purple-500',
  cooperation: 'bg-blue-500',
  investment: 'bg-yellow-500',
  event: 'bg-orange-500',
  stock: 'bg-red-500',
  finance: 'bg-gray-500',
  brand: 'bg-indigo-500',
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Daily trend chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-2">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-lg">📊</span> 新闻每日分布
        </h3>
        <div className="flex items-end gap-1 h-24 overflow-x-auto pb-2">
          {dailyTrend.map(({ date, count }) => (
            <div key={date} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: '28px' }}>
              <span className="text-xs text-gray-500 font-bold">{count}</span>
              <div
                className="w-5 rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:from-blue-700 hover:to-blue-500"
                style={{ height: `${Math.max(8, (count / maxCount) * 64)}px` }}
                title={`${date}: ${count}篇`}
              />
              <span className="text-xs text-gray-400" style={{ fontSize: '9px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '32px' }}>
                {date.slice(5)}
              </span>
            </div>
          ))}
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mt-3 flex-wrap">
          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
            近7天 <strong>{stats.last7d}</strong> 篇
          </span>
          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
            近30天 <strong>{stats.last30d}</strong> 篇
          </span>
          <span className="bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
            共收录 <strong>{stats.total}</strong> 篇
          </span>
        </div>

        {/* Category breakdown */}
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2">分类分布</h4>
          <div className="flex flex-wrap gap-2">
            {categoryList.map((cat) => {
              const count = stats.categoryCount[cat.value] || 0;
              const pct = Math.round((count / stats.total) * 100);
              return (
                <div
                  key={cat.value}
                  className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1"
                >
                  <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat.value] || 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-600">{cat.label}</span>
                  <span className="text-xs font-bold text-gray-800">{count}</span>
                  <span className="text-xs text-gray-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-lg">📰</span> 来源分布
        </h3>
        <div className="space-y-3">
          {stats.topSource.map(([source, count], i) => (
            <div key={source} className="flex items-center gap-3">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-blue-600 text-white' : i === 1 ? 'bg-blue-400 text-white' : i === 2 ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{source}</p>
                <div className="bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-blue-300' : 'bg-blue-200'}`}
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700 flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">数据来源涵盖：163.com、新浪财经、金融界、证券时报、全球TMT等</p>
        </div>
      </div>
    </div>
  );
}
