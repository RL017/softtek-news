import type { NewsItem } from '../lib/types';

interface Props {
  news: NewsItem;
  keyword: string;
  onClick: () => void;
  isActive: boolean;
}

const CATEGORY_META: Record<string, { label: string; bar: string; badge: string; text: string }> = {
  bid:         { label: '中标/合同', bar: 'bg-green-500',  badge: 'bg-green-50',  text: 'text-green-700' },
  product:     { label: '产品发布', bar: 'bg-purple-500', badge: 'bg-purple-50', text: 'text-purple-700' },
  cooperation: { label: '战略合作', bar: 'bg-blue-500',   badge: 'bg-blue-50',   text: 'text-blue-700' },
  investment:  { label: '投资融资', bar: 'bg-yellow-500', badge: 'bg-yellow-50', text: 'text-yellow-700' },
  event:       { label: '活动峰会', bar: 'bg-orange-500', badge: 'bg-orange-50', text: 'text-orange-700' },
  stock:       { label: '股市行情', bar: 'bg-red-500',    badge: 'bg-red-50',    text: 'text-red-700' },
  finance:     { label: '财务相关', bar: 'bg-gray-400',   badge: 'bg-gray-50',   text: 'text-gray-600' },
  brand:       { label: '品牌动态', bar: 'bg-indigo-500', badge: 'bg-indigo-50', text: 'text-indigo-700' },
};

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic">
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
  const meta = CATEGORY_META[news.category] || {
    label: news.category, bar: 'bg-gray-400', badge: 'bg-gray-50', text: 'text-gray-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isActive ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-100 hover:border-blue-200'
      }`}
    >
      {/* Color bar */}
      <div className={`h-1 w-full ${meta.bar}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`${meta.badge} ${meta.text} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
            {meta.label}
          </span>
          <span className="text-xs text-gray-400 truncate max-w-[80px]">{news.source}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{news.date}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2 text-[15px] hover:text-blue-700 transition-colors flex-1">
          <Highlight text={news.title} keyword={keyword} />
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mt-auto">
          <Highlight text={news.summary} keyword={keyword} />
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">点击查看详情</span>
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          原文
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
