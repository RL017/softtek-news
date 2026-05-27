import type { NewsItem } from '../lib/types';

interface Props {
  news: NewsItem;
  keyword: string;
  onClick: () => void;
  isActive: boolean;
}

function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    bid: { bg: 'bg-green-50', text: 'text-green-700' },
    product: { bg: 'bg-purple-50', text: 'text-purple-700' },
    cooperation: { bg: 'bg-blue-50', text: 'text-blue-700' },
    investment: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    event: { bg: 'bg-orange-50', text: 'text-orange-700' },
    stock: { bg: 'bg-red-50', text: 'text-red-700' },
    finance: { bg: 'bg-gray-50', text: 'text-gray-700' },
    brand: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  };
  return colors[category] || { bg: 'bg-gray-50', text: 'text-gray-700' };
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    bid: '中标/合同',
    product: '产品发布',
    cooperation: '战略合作',
    investment: '投资融资',
    event: '活动峰会',
    stock: '股市行情',
    finance: '财务相关',
    brand: '品牌动态',
  };
  return labels[category] || category;
}

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function NewsCard({ news, keyword, onClick, isActive }: Props) {
  const colors = getCategoryColor(news.category);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
        isActive ? 'ring-2 ring-blue-500 border-blue-200 shadow-md' : 'border-gray-100 hover:border-blue-200'
      }`}
    >
      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`${colors.bg} ${colors.text} text-xs font-medium px-2 py-0.5 rounded-full`}>
            {getCategoryLabel(news.category)}
          </span>
          <span className="text-xs text-gray-400">{news.source}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{news.date}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2 hover:text-blue-700 transition-colors">
          <Highlight text={news.title} keyword={keyword} />
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          <Highlight text={news.summary} keyword={keyword} />
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">阅读详情 →</span>
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          原文
        </a>
      </div>
    </div>
  );
}
