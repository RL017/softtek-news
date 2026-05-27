'use client';

import { useState, useMemo } from 'react';
import newsData from '../data/news.json';
import type { NewsItem, FilterOptions } from '../lib/types';
import NewsCard from '../components/NewsCard';
import FilterBar from '../components/FilterBar';
import StatsPanel from '../components/StatsPanel';

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'bid', label: '中标/合同' },
  { value: 'product', label: '产品发布' },
  { value: 'cooperation', label: '战略合作' },
  { value: 'investment', label: '投资融资' },
  { value: 'event', label: '活动峰会' },
  { value: 'stock', label: '股市行情' },
  { value: 'brand', label: '品牌动态' },
  { value: 'finance', label: '财务相关' },
];

const PAGE_SIZE = 9;

const SUGGESTED_KEYWORDS = ['AI', '中标', '战略合作', '股市', '发布', '投资'];

function isWithinDays(dateStr: string, days: number): boolean {
  const newsDate = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

// ---- 关键词提取 ----
const KEYWORD_DICT = [
  'AI', 'DeepSeek', '大模型', '智能体', '鸿蒙', '昇腾', '欧拉', '鲲鹏',
  '中标', '合同', '融资', '投资', '战略合作', '签署', '发布', '峰会',
  '华为', '中国移动', '中国电信', '中国银行', '央企', '信创',
  '数字经济', '数字化', '金融科技', '智慧城市', '算力',
  '睿动AI', '软通数智', 'ESG', '等保', '股票', '大宗交易', '融资融券',
];

function extractKeywords(news: NewsItem): string[] {
  const text = news.title + ' ' + news.summary + ' ' + news.content;
  return KEYWORD_DICT.filter((kw) => text.includes(kw)).slice(0, 8);
}

// ---- 市场影响评级 ----
const POSITIVE_SIGNALS = ['中标', '合同', '战略合作', '融资', '投资', '发布', '认证', '荣获', '增长', '提升', '签约', '入选'];
const NEGATIVE_SIGNALS = ['跌', '减持', '折价', '下滑', '风险', '亏损'];

function getMarketSentiment(news: NewsItem): { label: string; color: string; bg: string; desc: string } {
  const text = news.title + news.summary + news.content;
  if (news.category === 'stock') {
    const isNeg = NEGATIVE_SIGNALS.some((s) => text.includes(s));
    if (isNeg) return { label: '偏空', color: 'text-red-600', bg: 'bg-red-50 border-red-100', desc: '短期股价承压，关注技术面支撑位' };
    return { label: '中性', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-100', desc: '正常市场波动，建议持续观察' };
  }
  if (news.category === 'finance') {
    const isPos = text.includes('增长') || text.includes('提升') || text.includes('盈利');
    if (isPos) return { label: '利好', color: 'text-green-600', bg: 'bg-green-50 border-green-100', desc: '财务表现改善，有望提振市场信心' };
    return { label: '中性', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-100', desc: '财务信息披露，关注后续资金安排' };
  }
  const posCount = POSITIVE_SIGNALS.filter((s) => text.includes(s)).length;
  if (posCount >= 2) return { label: '利好', color: 'text-green-600', bg: 'bg-green-50 border-green-100', desc: '业务拓展积极，有望强化市场认知' };
  if (posCount === 1) return { label: '偏正面', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', desc: '短期催化剂，关注后续落地情况' };
  return { label: '中性', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-100', desc: '信息披露常规，暂无明确方向性影响' };
}

// ---- CATEGORY_META（弹窗复用）----
const MODAL_CATEGORY_META: Record<string, { label: string; badge: string; text: string; bar: string }> = {
  bid:         { label: '中标/合同', bar: 'bg-green-500',  badge: 'bg-green-100',  text: 'text-green-700' },
  product:     { label: '产品发布', bar: 'bg-purple-500', badge: 'bg-purple-100', text: 'text-purple-700' },
  cooperation: { label: '战略合作', bar: 'bg-blue-500',   badge: 'bg-blue-100',   text: 'text-blue-700' },
  investment:  { label: '投资融资', bar: 'bg-yellow-500', badge: 'bg-yellow-100', text: 'text-yellow-700' },
  event:       { label: '活动峰会', bar: 'bg-orange-500', badge: 'bg-orange-100', text: 'text-orange-700' },
  stock:       { label: '股市行情', bar: 'bg-red-500',    badge: 'bg-red-100',    text: 'text-red-700' },
  finance:     { label: '财务相关', bar: 'bg-gray-400',   badge: 'bg-gray-100',   text: 'text-gray-600' },
  brand:       { label: '品牌动态', bar: 'bg-indigo-500', badge: 'bg-indigo-100', text: 'text-indigo-700' },
};

// ---- 详情弹窗组件 ----
interface DetailModalProps {
  news: NewsItem;
  allNews: NewsItem[];
  categories: { value: string; label: string }[];
  closing: boolean;
  onClose: () => void;
  onSelect: (n: NewsItem) => void;
}

function DetailModal({ news, allNews, categories, closing, onClose, onSelect }: DetailModalProps) {
  const [copied, setCopied] = useState(false);
  const meta = MODAL_CATEGORY_META[news.category] || { label: news.category, bar: 'bg-gray-400', badge: 'bg-gray-100', text: 'text-gray-600' };
  const keywords = extractKeywords(news);
  const sentiment = getMarketSentiment(news);
  const related = allNews
    .filter((n) => n.id !== news.id && n.category === news.category)
    .slice(0, 3);

  function handleCopy() {
    navigator.clipboard.writeText(news.title + '\n\n' + news.summary + '\n\n' + news.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${closing ? 'bg-opacity-0' : 'bg-opacity-50'}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ${closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-1.5 w-full rounded-t-2xl ${meta.bar}`} />
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`${meta.badge} ${meta.text} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                {meta.label}
              </span>
              <span className="text-xs text-gray-400">{news.source}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{news.date}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{news.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 摘要 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wide">摘要</p>
            <p className="text-blue-900 text-sm leading-relaxed">{news.summary}</p>
          </div>

          {/* 正文 */}
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">正文</p>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{news.content}</p>
          </div>

          {/* 关键词标签 */}
          {keywords.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">关键词</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-default">
                    # {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 市场影响评级 */}
          <div className={`rounded-xl p-4 border ${sentiment.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">市场影响评级</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sentiment.color} bg-white border`}>
                {sentiment.label}
              </span>
            </div>
            <p className={`text-xs ${sentiment.color} leading-relaxed`}>{sentiment.desc}</p>
            <p className="text-xs text-gray-400 mt-1.5">* 仅供参考，不构成投资建议</p>
          </div>

          {/* 相关新闻 */}
          {related.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">
                同类新闻推荐 · {categories.find(c => c.value === news.category)?.label}
              </p>
              <div className="space-y-2">
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                  >
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{r.source} · {r.date}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作 */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              查看原文
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 text-sm transition-colors ${copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制全文
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    keyword: '',
    category: 'all',
    dateRange: 'all',
    sortOrder: 'newest',
  });
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [page, setPage] = useState(1);
  const [modalClosing, setModalClosing] = useState(false);

  const allNews = newsData as NewsItem[];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allNews.forEach((n) => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [allNews]);

  const filteredNews = useMemo(() => {
    setPage(1);
    const result = allNews.filter((news) => {
      const matchKeyword =
        filters.keyword === '' ||
        news.title.includes(filters.keyword) ||
        news.summary.includes(filters.keyword) ||
        news.content.includes(filters.keyword);
      const matchCategory =
        filters.category === 'all' || news.category === filters.category;
      const withinDate =
        filters.dateRange === 'all' ||
        (filters.dateRange === '7d' && isWithinDays(news.date, 7)) ||
        (filters.dateRange === '30d' && isWithinDays(news.date, 30));
      return matchKeyword && matchCategory && withinDate;
    });
    result.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return filters.sortOrder === 'newest' ? -diff : diff;
    });
    return result;
  }, [filters, allNews]);

  const stats = useMemo(() => {
    const total = filteredNews.length;
    const last7d = filteredNews.filter((n) => isWithinDays(n.date, 7)).length;
    const last30d = filteredNews.filter((n) => isWithinDays(n.date, 30)).length;
    const categoryCount: Record<string, number> = {};
    filteredNews.forEach((n) => {
      categoryCount[n.category] = (categoryCount[n.category] || 0) + 1;
    });
    const topSource = Object.entries(
      filteredNews.reduce((acc, n) => {
        acc[n.source] = (acc[n.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]);
    return { total, last7d, last30d, categoryCount, topSource };
  }, [filteredNews]);

  const pagedNews = filteredNews.slice(0, page * PAGE_SIZE);
  const hasMore = pagedNews.length < filteredNews.length;

  function closeModal() {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedNews(null);
      setModalClosing(false);
    }, 200);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white pt-8 pb-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-xl font-bold text-blue-700">软</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">软通新闻智能整理器</h1>
              <p className="text-blue-200 text-sm mt-0.5">实时追踪软通动力最新动态 · 智能分类 · 全文检索</p>
            </div>
          </div>

          {/* Search in header */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索新闻标题、摘要或内容..."
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              className="w-full pl-11 pr-10 py-3 rounded-xl text-sm text-gray-900 bg-white bg-opacity-95 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 placeholder-gray-400 shadow-sm"
            />
            {filters.keyword && (
              <button
                onClick={() => setFilters((f) => ({ ...f, keyword: '' }))}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>

          {/* Stats badges */}
          <div className="mt-4 flex gap-3 text-sm text-blue-100 flex-wrap">
            <span className="bg-white bg-opacity-10 px-3 py-1 rounded-full text-xs">
              近7天 <strong className="text-white">{stats.last7d}</strong> 篇
            </span>
            <span className="bg-white bg-opacity-10 px-3 py-1 rounded-full text-xs">
              近30天 <strong className="text-white">{stats.last30d}</strong> 篇
            </span>
            <span className="bg-white bg-opacity-10 px-3 py-1 rounded-full text-xs">
              {filters.category === 'all' && filters.keyword === '' && filters.dateRange === 'all'
                ? <>共收录 <strong className="text-white">{allNews.length}</strong> 篇</>
                : <>筛选结果 <strong className="text-white">{stats.total}</strong> 篇</>
              }
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Stats Panel */}
        <div>
          <button
            onClick={() => setShowStats((v) => !v)}
            className="mb-3 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            <span>{showStats ? '▲' : '▼'}</span>
            {showStats ? '收起统计面板' : `展开统计面板（当前筛选 ${filteredNews.length} 条）`}
          </button>
          {showStats && <StatsPanel news={filteredNews} stats={stats} categories={CATEGORIES} />}
        </div>

        {/* Filter Bar */}
        <FilterBar
          categories={CATEGORIES}
          value={filters.category}
          dateRange={filters.dateRange}
          sortOrder={filters.sortOrder}
          categoryCounts={categoryCounts}
          onCategoryChange={(category) => setFilters((f) => ({ ...f, category }))}
          onDateRangeChange={(dateRange) => setFilters((f) => ({ ...f, dateRange: dateRange as FilterOptions['dateRange'] }))}
          onSortOrderChange={(sortOrder) => setFilters((f) => ({ ...f, sortOrder: sortOrder as FilterOptions['sortOrder'] }))}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            共找到 <strong className="text-blue-700">{filteredNews.length}</strong> 条新闻
            {filters.keyword && (
              <span className="ml-1">
                · 关键词 <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded font-medium">「{filters.keyword}」</span>
              </span>
            )}
          </p>
          {filters.keyword && (
            <button
              onClick={() => setFilters((f) => ({ ...f, keyword: '' }))}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              清除 ×
            </button>
          )}
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-gray-500">未找到相关新闻</p>
            <p className="text-sm mt-1 mb-6">试试以下关键词</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setFilters((f) => ({ ...f, keyword: kw }))}
                  className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pagedNews.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  keyword={filters.keyword}
                  onClick={() => setSelectedNews(news)}
                  isActive={selectedNews?.id === news.id}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                >
                  加载更多（还有 {filteredNews.length - pagedNews.length} 条）
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <DetailModal
          news={selectedNews}
          allNews={allNews}
          categories={CATEGORIES}
          closing={modalClosing}
          onClose={closeModal}
          onSelect={(n) => { closeModal(); setTimeout(() => setSelectedNews(n), 210); }}
        />
      )}

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40"
        title="回到顶部"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-gray-400 text-xs">
        <p>数据来源：163.com · 新浪财经 · 金融界等公开媒体 · 仅供学习参考</p>
        <p className="mt-1">Powered by 软通新闻智能整理器 · {new Date().toLocaleDateString('zh-CN')}</p>
      </footer>
    </main>
  );
}
