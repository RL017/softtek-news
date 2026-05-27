export interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  url: string;
  category: string;
  summary: string;
  content: string;
}

export interface FilterOptions {
  keyword: string;
  category: string;
  dateRange: 'all' | '7d' | '30d';
  sortOrder: 'newest' | 'oldest';
}
