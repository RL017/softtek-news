interface Category {
  value: string;
  label: string;
}

interface Props {
  categories: Category[];
  value: string;
  dateRange: string;
  sortOrder: string;
  categoryCounts: Record<string, number>;
  onCategoryChange: (v: string) => void;
  onDateRangeChange: (v: string) => void;
  onSortOrderChange: (v: string) => void;
}

const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  all:         'bg-blue-600 text-white border-blue-600',
  bid:         'bg-green-600 text-white border-green-600',
  product:     'bg-purple-600 text-white border-purple-600',
  cooperation: 'bg-blue-500 text-white border-blue-500',
  investment:  'bg-yellow-500 text-white border-yellow-500',
  event:       'bg-orange-500 text-white border-orange-500',
  stock:       'bg-red-500 text-white border-red-500',
  finance:     'bg-gray-500 text-white border-gray-500',
  brand:       'bg-indigo-600 text-white border-indigo-600',
};

export default function FilterBar({
  categories,
  value,
  dateRange,
  sortOrder,
  categoryCounts,
  onCategoryChange,
  onDateRangeChange,
  onSortOrderChange,
}: Props) {
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Category tabs */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-2">分类筛选</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = cat.value === 'all' ? totalCount : (categoryCounts[cat.value] || 0);
            const isActive = value === cat.value;
            const activeColor = CATEGORY_ACTIVE_COLORS[cat.value] || 'bg-gray-600 text-white border-gray-600';
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? activeColor
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {cat.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold leading-none ${
                  isActive ? 'bg-white bg-opacity-25 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-50" />

      {/* Date + Sort */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1.5">时间范围</p>
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {[
              { value: 'all', label: '全部' },
              { value: '7d', label: '近7天' },
              { value: '30d', label: '近30天' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => onDateRangeChange(range.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  dateRange === range.value
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium mb-1.5">排序方式</p>
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {[
              { value: 'newest', label: '最新' },
              { value: 'oldest', label: '最早' },
            ].map((order) => (
              <button
                key={order.value}
                onClick={() => onSortOrderChange(order.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sortOrder === order.value
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {order.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
