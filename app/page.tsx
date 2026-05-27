'use client';

import { useState, useMemo } from 'react';
import newsData from '../data/news.json';
import type { NewsItem, FilterOptions } from '../lib/types';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
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
  });

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const filteredNews = useMemo(() => {
    return (newsData as NewsItem[]).filter((news) => {
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
  }, [filters]);

  const stats = useMemo(() => {
    const total = (newsData as NewsItem[]).length;
    const last7d = (newsData as NewsItem[]).filter((n) => isWithinDays(n.date, 7)).length;
    const last30d = (newsData as NewsItem[]).filter((n) => isWithinDays(n.date, 30)).length;
    const categoryCount: Record<string, number> = {};
    (newsData as NewsItem[]).forEach((n) => {
      categoryCount[n.category] = (categoryCount[n.category] || 0) + 1;
    });
    const topSource = Object.entries(
      (newsData as NewsItem[]).reduce((acc, n) => {
        acc[n.source] = (acc[n.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return { total, last7d, last30d, categoryCount, topSource };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-10 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
              <span className="text-2xl font-bold text-blue-700">软</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">软通动力新闻智能整理器</h1>
              <p className="text-blue-200 text-sm mt-1">实时追踪软通动力最新动态 · 智能分类 · 全文检索</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm text-blue-100">
            <span className="bg-blue-600 bg-opacity-40 px-3 py-1 rounded-full">
              近7天 <strong className="text-white">{stats.last7d}</strong> 篇
            </span>
            <span className="bg-blue-600 bg-opacity-40 px-3 py-1 rounded-full">
              近30天 <strong className="text-white">{stats.last30d}</strong> 篇
            </span>
            <span className="bg-blue-600 bg-opacity-40 px-3 py-1 rounded-full">
              共收录 <strong className="text-white">{stats.total}</strong> 篇
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Panel */}
        <StatsPanel stats={stats} categories={CATEGORIES} />

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={filters.keyword}
              onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))}
            />
            <FilterBar
              categories={CATEGORIES}
              value={filters.category}
              dateRange={filters.dateRange}
              onCategoryChange={(category) => setFilters((f) => ({ ...f, category }))}
              onDateRangeChange={(dateRange) => setFilters((f) => ({ ...f, dateRange: dateRange as FilterOptions['dateRange'] }))}
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            共找到 <strong className="text-blue-700">{filteredNews.length}</strong> 条相关新闻
          </p>
          {filters.keyword && (
            <button
              onClick={() => setFilters((f) => ({ ...f, keyword: '' }))}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              清除搜索 ×
            </button>
          )}
        </div>

        {/* News List */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">未找到相关新闻</p>
            <p className="text-sm mt-1">试试调整搜索关键词或筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNews.map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                onClick={() => setSelectedNews(news)}
                isActive={selectedNews?.id === news.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
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
                <h2 className="text-xl font-bold text-gray-900 leading-snug">{selectedNews.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0 mt-1"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-1">摘要</p>
                <p className="text-blue-900 text-sm leading-relaxed">{selectedNews.summary}</p>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedNews.content}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  查看原文 →
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedNews.title + '\n' + selectedNews.content);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  复制全文 📋
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-gray-400 text-sm">
        <p>数据来源：163.com · 新浪财经 · 金融界等公开媒体 · 仅供学习参考</p>
        <p className="mt-1">Powered by 软通新闻智能整理器 · {new Date().toLocaleDateString('zh-CN')}</p>
      </footer>
    </main>
  );
}
