import { FiFilter, FiRefreshCw } from 'react-icons/fi';

function ProductFilters({
  categories = [],
  filters,
  onChange,
  onReset,
}) {
  const updateFilter = (name, value) => {
    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* Filter heading */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <FiFilter />
          Filters
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium text-orange-600"
        >
          <FiRefreshCw />
          Reset
        </button>
      </div>

      {/* Category filter */}
      <section className="border-b border-gray-200 pb-6">
        <h3 className="mb-4 font-semibold">
          Categories
        </h3>

        <div className="space-y-3">

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              name="category"
              checked={filters.category === ''}
              onChange={() =>
                updateFilter('category', '')
              }
              className="accent-orange-600"
            />
            All Categories
          </label>

          {categories.map((category) => (
            <label
              key={category._id}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="radio"
                name="category"
                checked={
                  filters.category === category._id
                }
                onChange={() =>
                  updateFilter(
                    'category',
                    category._id
                  )
                }
                className="accent-orange-600"
              />

              {category.name}
            </label>
          ))}

        </div>
      </section>

      {/* Price range */}
      <section className="border-b border-gray-200 py-6">

        <h3 className="mb-4 font-semibold">
          Price Range (LKR)
        </h3>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label
              htmlFor="minPrice"
              className="mb-2 block text-xs text-gray-500"
            >
              Minimum
            </label>

            <input
              id="minPrice"
              type="number"
              min="0"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) =>
                updateFilter(
                  'minPrice',
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="maxPrice"
              className="mb-2 block text-xs text-gray-500"
            >
              Maximum
            </label>

            <input
              id="maxPrice"
              type="number"
              min="0"
              placeholder="200000"
              value={filters.maxPrice}
              onChange={(e) =>
                updateFilter(
                  'maxPrice',
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

        </div>

      </section>

      {/* Rating filter */}
      <section className="py-6">

        <h3 className="mb-4 font-semibold">
          Customer Rating
        </h3>

        <div className="space-y-3">

          {[
            { value: '', label: 'All Ratings' },
            { value: '4', label: '★★★★☆ & above' },
            { value: '3', label: '★★★☆☆ & above' },
            { value: '2', label: '★★☆☆☆ & above' },
          ].map((rating) => (
            <label
              key={rating.value}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >
              <input
                type="radio"
                name="rating"
                checked={
                  filters.rating === rating.value
                }
                onChange={() =>
                  updateFilter(
                    'rating',
                    rating.value
                  )
                }
                className="accent-orange-600"
              />

              <span
                className={
                  rating.value
                    ? 'text-amber-500'
                    : 'text-gray-700'
                }
              >
                {rating.label}
              </span>
            </label>
          ))}

        </div>

      </section>

      {/* Clear all filters */}
      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-orange-600 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
      >
        Clear All Filters
      </button>

    </aside>
  );
}

export default ProductFilters;
