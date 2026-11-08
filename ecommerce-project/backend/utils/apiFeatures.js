/**
 * API Features helper class for filtering, sorting, pagination, and search
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.keyword) {
      const keyword = {
        $or: [
          { name: { $regex: this.queryString.keyword, $options: 'i' } },
          { description: { $regex: this.queryString.keyword, $options: 'i' } },
          { brand: { $regex: this.queryString.keyword, $options: 'i' } },
        ],
      };
      this.query = this.query.find(keyword);
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Filter by category
    if (queryObj.category) {
      this.query = this.query.find({ category: queryObj.category });
      delete queryObj.category;
    }

    // Filter by brand
    if (queryObj.brand) {
      this.query = this.query.find({ brand: { $regex: queryObj.brand, $options: 'i' } });
      delete queryObj.brand;
    }

    // Price range filter
    if (queryObj.minPrice || queryObj.maxPrice) {
      const priceFilter = {};
      if (queryObj.minPrice) priceFilter.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) priceFilter.$lte = Number(queryObj.maxPrice);

      // Filter by effective price (discount price if set, else original price)
      this.query = this.query.find({
        $or: [
          { discountPrice: { $gt: 0, ...priceFilter } },
          { $and: [{ discountPrice: 0 }, { price: priceFilter }] },
        ],
      });
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    // Rating filter
    if (queryObj.rating) {
      this.query = this.query.find({ ratings: { $gte: Number(queryObj.rating) } });
      delete queryObj.rating;
    }

    // Featured / new arrival / best seller flags
    if (queryObj.isFeatured) {
      this.query = this.query.find({ isFeatured: queryObj.isFeatured === 'true' });
      delete queryObj.isFeatured;
    }
    if (queryObj.isNewArrival) {
      this.query = this.query.find({ isNewArrival: queryObj.isNewArrival === 'true' });
      delete queryObj.isNewArrival;
    }
    if (queryObj.isBestSeller) {
      this.query = this.query.find({ isBestSeller: queryObj.isBestSeller === 'true' });
      delete queryObj.isBestSeller;
    }

    // Apply remaining filters
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      switch (this.queryString.sort) {
        case 'price_asc':
          this.query = this.query.sort('price');
          break;
        case 'price_desc':
          this.query = this.query.sort('-price');
          break;
        case 'newest':
          this.query = this.query.sort('-createdAt');
          break;
        case 'popularity':
          this.query = this.query.sort('-soldCount');
          break;
        case 'rating':
          this.query = this.query.sort('-ratings');
          break;
        default:
          this.query = this.query.sort('-createdAt');
      }
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(resPerPage = 12) {
    const currentPage = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || resPerPage;
    const skip = (currentPage - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.currentPage = currentPage;
    this.limit = limit;

    return this;
  }
}

module.exports = APIFeatures;
