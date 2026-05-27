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
  return (
    <div className="flex flex-col gap-3">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = cat.value === 'all'
            ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
            : (categoryCounts[cat.value] || 0);
          const isActive = value === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Date range + Sort */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Date Range */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { value: 'all', label: '全部时间' },
            { value: '7d', label: '近7天' },
            { value: '30d', label: '近30天' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onDateRangeChange(range.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                dateRange === range.value
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Sort Order */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { value: 'newest', label: '最新优先' },
            { value: 'oldest', label: '最早优先' },
          ].map((order) => (
            <button
              key={order.value}
              onClick={() => onSortOrderChange(order.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
  );
}
