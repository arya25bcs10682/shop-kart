export default function SearchBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home']
}) {
  return (
    <div className="clay-card p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
      {/* Search Input Box */}
      <div className="relative w-full sm:flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="product-search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 text-sm text-stone-900 clay-input placeholder-stone-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="w-full sm:w-auto min-w-[200px] flex items-center gap-2">
        <label htmlFor="category-select" className="text-xs font-semibold uppercase tracking-wider text-stone-500 shrink-0 hidden md:block">
          Category:
        </label>
        <div className="relative w-full">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2.5 text-sm text-stone-900 clay-input appearance-none cursor-pointer pr-9 font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

