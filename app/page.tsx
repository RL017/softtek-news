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
  const now = new Date('2026-05-27');
  const diff = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    keyword: '',
    category: 'all',
    dateRange: 'all',
    sortOrder: 'newest',
  });
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showStats, setShowStats] = useState(true);
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
    const total = allNews.length;
    const last7d = allNews.filter((n) => isWithinDays(n.date, 7)).length;
    const last30d = allNews.filter((n) => isWithinDays(n.date, 30)).length;
    const categoryCount: Record<string, number> = {};
    allNews.forEach((n) => {
      categoryCount[n.category] = (categoryCount[n.category] || 0) + 1;
    });
    const topSource = Object.entries(
      allNews.reduce((acc, n) => {
        acc[n.source] = (acc[n.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]);
    return { total, last7d, last30d, categoryCount, topSource };
  }, [allNews]);

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
              共收录 <strong className="text-white">{stats.total}</strong> 篇
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
            {showStats ? '收起统计面板' : '展开统计面板'}
          </button>
          {showStats && <StatsPanel news={allNews} stats={stats} categories={CATEGORIES} />}
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
        <div
          className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${modalClosing ? 'bg-opacity-0' : 'bg-opacity-50'}`}
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl transition-all duration-200 ${modalClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedNews.category === 'bid' ? 'bg-green-100 text-green-700' :
                    selectedNews.category === 'product' ? 'bg-purple-100 text-purple-700' :
                    selectedNews.category === 'cooperation' ? 'bg-blue-100 text-blue-700' :
                    selectedNews.category === 'investment' ? 'bg-yellow-100 text-yellow-700' :
                    selectedNews.category === 'event' ? 'bg-orange-100 text-orange-700' :
                    selectedNews.category === 'stock' ? 'bg-red-100 text-red-700' :
                    selectedNews.category === 'finance' ? 'bg-gray-100 text-gray-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {CATEGORIES.find(c => c.value === selectedNews.category)?.label || selectedNews.category}
                  </span>
                  <span className="text-xs text-gray-400">{selectedNews.source}</span>
                  <span className="text-xs text-gray-400">{selectedNews.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{selectedNews.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">摘要</p>
                <p className="text-blue-900 text-sm leading-relaxed">{selectedNews.summary}</p>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedNews.content}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={selectedNews.url}
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
                  onClick={() => navigator.clipboard.writeText(selectedNews.title + '\n\n' + selectedNews.content)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制全文
                </button>
              </div>
            </div>
          </div>
        </div>
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
