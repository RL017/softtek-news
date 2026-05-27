interface Category {
  value: string;
  label: string;
}

interface Props {
  categories: Category[];
  value: string;
  dateRange: string;
  onCategoryChange: (v: string) => void;
  onDateRangeChange: (v: string) => void;
}

export default function FilterBar({
  categories,
  value,
  dateRange,
  onCategoryChange,
  onDateRangeChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Category Select */}
      <select
        value={value}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-gray-700 cursor-pointer"
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Date Range Buttons */}
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
    </div>
  );
}
