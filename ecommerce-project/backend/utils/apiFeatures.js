/**
 * Shopora API Features
 * Search, filtering, sorting and pagination
 */

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Search products
  search() {
    const keyword = this.queryString.keyword;

    if (typeof keyword === 'string' && keyword.trim()) {
      const searchTerm = escapeRegex(
        keyword.trim().slice(0, 100)
      );

      this.query = this.query.and([
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      ]);
    }

    return this;
  }

  // 2. Filter products
  filter() {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      isFeatured,
      isNewArrival,
      isBestSeller,
    } = this.queryString;

    // Category filter
    if (
      typeof category === 'string' &&
      /^[a-fA-F0-9]{24}$/.test(category)
    ) {
      this.query = this.query.find({ category });
    }

    // Brand filter
    if (typeof brand === 'string' && brand.trim()) {
      this.query = this.query.find({
        brand: {
          $regex: escapeRegex(brand.trim().slice(0, 100)),
          $options: 'i',
        },
      });
    }

    // Price range filter
    const priceFilter = {};

    if (
      typeof minPrice === 'string' &&
      minPrice.trim() !== '' &&
      Number.isFinite(Number(minPrice)) &&
      Number(minPrice) >= 0
    ) {
      priceFilter.$gte = Number(minPrice);
    }

    if (
      typeof maxPrice === 'string' &&
      maxPrice.trim() !== '' &&
      Number.isFinite(Number(maxPrice)) &&
      Number(maxPrice) >= 0
    ) {
      priceFilter.$lte = Number(maxPrice);
    }

    // Filter by effective selling price
    if (Object.keys(priceFilter).length > 0) {
      this.query = this.query.and([
        {
          $or: [
            {
              discountPrice: {
                $gt: 0,
                ...priceFilter,
              },
            },
            {
              discountPrice: 0,
              price: priceFilter,
            },
          ],
        },
      ]);
    }

    // Rating filter
    if (
      typeof rating === 'string' &&
      rating.trim() !== '' &&
      Number.isFinite(Number(rating)) &&
      Number(rating) >= 0 &&
      Number(rating) <= 5
    ) {
      this.query = this.query.find({
        ratings: { $gte: Number(rating) },
      });
    }

    // Featured, new arrival and best seller filters
    const flags = {
      isFeatured,
      isNewArrival,
      isBestSeller,
    };

    for (const [key, value] of Object.entries(flags)) {
      if (value === 'true' || value === 'false') {
        this.query = this.query.find({
          [key]: value === 'true',
        });
      }
    }

    return this;
  }

  // 3. Sort products
  sort() {
    const sortOptions = {
      price_asc: { price: 1, _id: 1 },
      price_desc: { price: -1, _id: 1 },
      newest: { createdAt: -1, _id: -1 },
      popularity: { soldCount: -1, _id: 1 },
      rating: { ratings: -1, _id: 1 },
    };

    const selectedSort = this.queryString.sort;

    const sortBy =
      typeof selectedSort === 'string' &&
      Object.hasOwn(sortOptions, selectedSort)
        ? sortOptions[selectedSort]
        : sortOptions.newest;

    this.query = this.query.sort(sortBy);

    return this;
  }

  // 4. Pagination
  paginate(resPerPage = 12) {
    const requestedPage = Number(this.queryString.page);
    const requestedLimit = Number(this.queryString.limit);

    const currentPage =
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, 10000)
        : 1;

    const limit =
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : resPerPage;

    const skip = (currentPage - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    this.currentPage = currentPage;
    this.limit = limit;

    return this;
  }
}

module.exports = APIFeatures;
