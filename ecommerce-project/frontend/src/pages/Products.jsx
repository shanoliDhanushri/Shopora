import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  FiSearch,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
} from 'react-icons/fi';

import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';

import {
  productService,
  categoryService,
} from '../services/api';

const initialFilters = {
  category: '',
  minPrice: '',
  maxPrice: '',
  rating: '',
};

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const [filters, setFilters] =
    useState(initialFilters);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] =
    useState('');

  // Load categories
  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const response =
          await categoryService.getAll();

        if (active) {
          setCategories(response.data.data || []);
        }
      } catch {
        if (active) {
          setCategoryError(
            'Unable to load categories.'
          );
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  // Validate price range
  const invalidPrice =
    (filters.minPrice !== '' &&
      Number(filters.minPrice) < 0) ||
    (filters.maxPrice !== '' &&
      Number(filters.maxPrice) < 0) ||
    (filters.minPrice !== '' &&
      filters.maxPrice !== '' &&
      Number(filters.minPrice) >
        Number(filters.maxPrice));

  // Load products
  useEffect(() => {
    let active = true;

    if (invalidPrice) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const timer = setTimeout(async () => {
      try {
        const params = {
          keyword: search,
          sort,
          page,
          limit: 12,
        };

        Object.entries(filters).forEach(
          ([key, value]) => {
            if (value !== '') {
              params[key] = value;
            }
          }
        );

        const response =
          await productService.getAll(params);

        if (!active) return;

        setProducts(response.data.data || []);
        setTotal(response.data.total || 0);
        setPages(response.data.pages || 0);
      } catch {
        if (active) {
          setError(
            'Unable to load products. Please try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, sort, page, filters, invalidPrice]);

  // Search products
  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(keyword.trim());
  };

  // Update filters
  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  // Reset all search options
  const resetAll = () => {
    setKeyword('');
    setSearch('');
    setSort('newest');
    setFilters(initialFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <Link
            to="/"
            className="text-3xl font-bold text-orange-600"
          >
            Shopora.
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
          >
            <FiArrowLeft />
            Back to Home
          </Link>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">

        {/* Page title */}
        <div className="mb-8">
          <p className="mb-2 text-sm text-gray-500">
            Home / Products
          </p>

          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Explore Our Products
          </h1>

          <p className="mt-2 text-gray-500">
            Discover quality products at great prices.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* Sidebar */}
          <div>
            <ProductFilters
              categories={categories}
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
            />

            {categoryError && (
              <p className="mt-3 text-sm text-red-500">
                {categoryError}
              </p>
            )}
          </div>

          {/* Main products area */}
          <section className="min-w-0">

            {/* Search and sorting */}
            <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm xl:flex-row">

              <form
                onSubmit={handleSearch}
                className="flex min-w-0 flex-1 gap-2"
              >
                <input
                  type="search"
                  aria-label="Search products"
                  value={keyword}
                  onChange={(e) =>
                    setKeyword(e.target.value)
                  }
                  placeholder="Search products..."
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm text-white"
                >
                  <FiSearch />
                  Search
                </button>
              </form>

              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price_asc">
                  Price: Low to High
                </option>

                <option value="price_desc">
                  Price: High to Low
                </option>

                <option value="popularity">
                  Most Popular
                </option>

                <option value="rating">
                  Top Rated
                </option>
              </select>

            </div>

            {/* Invalid price message */}
            {invalidPrice && (
              <div className="rounded-xl bg-red-50 p-5 text-sm text-red-600">
                Enter a valid price range.
                Minimum price cannot exceed maximum price.
              </div>
            )}

            {!invalidPrice && (
              <>

                {/* Product count */}
                {!loading && !error && (
                  <p className="mb-5 text-sm text-gray-500">
                    {total} products found
                  </p>
                )}

                {/* Loading */}
                {loading && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from(
                      { length: 6 },
                      (_, index) => (
                        <div
                          key={index}
                          className="h-96 animate-pulse rounded-2xl bg-gray-200"
                        />
                      )
                    )}
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
                    {error}
                  </div>
                )}

                {/* Empty state */}
                {!loading &&
                  !error &&
                  products.length === 0 && (
                    <div className="rounded-2xl bg-white py-20 text-center">

                      <FiPackage
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />

                      <h2 className="text-xl font-semibold">
                        No products found
                      </h2>

                      <p className="mt-2 text-gray-500">
                        Try changing your filters.
                      </p>

                      <button
                        onClick={resetAll}
                        className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-white"
                      >
                        Reset All
                      </button>

                    </div>
                  )}

                {/* Products */}
                {!loading && !error && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    ))}

                  </div>
                )}

                {/* Pagination */}
                {!loading &&
                  !error &&
                  pages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-4">

                      <button
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((p) => p - 1)
                        }
                        aria-label="Previous page"
                        className="rounded-lg border bg-white p-3 disabled:opacity-40"
                      >
                        <FiChevronLeft />
                      </button>

                      <span className="text-sm font-medium">
                        Page {page} of {pages}
                      </span>

                      <button
                        disabled={page >= pages}
                        onClick={() =>
                          setPage((p) => p + 1)
                        }
                        aria-label="Next page"
                        className="rounded-lg border bg-white p-3 disabled:opacity-40"
                      >
                        <FiChevronRight />
                      </button>

                    </div>
                  )}

              </>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}

export default Products;
