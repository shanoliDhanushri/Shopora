import { useState } from 'react';
import { FiHeart, FiShoppingCart, FiImage } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);

  const price = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice || 0);

  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const sellingPrice = hasDiscount ? discountPrice : price;

  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const image = product.images?.[0]?.url;
  const inStock = Number(product.stock) > 0;

  const formatPrice = (value) =>
    `LKR ${value.toLocaleString('en-LK')}`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">

      <div className="relative aspect-square bg-gray-100">

        {image && !imageError ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <FiImage size={42} />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-lg bg-orange-600 px-3 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        <button
          type="button"
          disabled
          title="Wishlist coming soon"
          className="absolute right-3 top-3 rounded-full bg-white p-3 text-gray-500 shadow"
        >
          <FiHeart size={18} />
        </button>

      </div>

      <div className="flex flex-1 flex-col p-4">

        <p className="mb-2 text-xs uppercase text-gray-400">
          {product.category?.name || 'Product'}
        </p>

        <h3 className="mb-3 min-h-12 font-semibold text-gray-900">
          {product.name}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <FaStar className="text-yellow-400" />

          <span className="text-sm text-gray-600">
            {Number(product.ratings || 0).toFixed(1)}
          </span>

          <span className="text-xs text-gray-400">
            ({product.numReviews || 0} reviews)
          </span>
        </div>

        <p className="text-lg font-bold text-orange-600">
          {formatPrice(sellingPrice)}
        </p>

        <p className="mb-3 min-h-5 text-sm text-gray-400">
          {hasDiscount && (
            <span className="line-through">
              {formatPrice(price)}
            </span>
          )}
        </p>

        <p className={`mb-4 text-xs ${
          inStock ? 'text-green-600' : 'text-red-500'
        }`}>
          {inStock ? '● In Stock' : '● Out of Stock'}
        </p>

        <button
          type="button"
          disabled
          title="Shopping cart coming soon"
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white opacity-60"
        >
          <FiShoppingCart size={18} />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>

      </div>
    </div>
  );
}

export default ProductCard;
