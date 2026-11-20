
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiImage } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { cartService, wishlistService } from '../services/api';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState('');

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  const price = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice || 0);

  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const sellingPrice = hasDiscount ? discountPrice : price;

  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const firstImage = product.images?.[0];
  const image =
    typeof firstImage === 'string' ? firstImage : firstImage?.url;

  const inStock = Number(product.stock) > 0;

  const formatPrice = (value) =>
    `LKR ${value.toLocaleString('en-LK')}`;

  const productLink = `/products/${product._id}`;

  // Check whether this product is already in the wishlist
  useEffect(() => {
    let active = true;

    const checkWishlist = async () => {
      if (!localStorage.getItem('token')) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await wishlistService.check(product._id);

        if (active) {
          setIsWishlisted(
            Boolean(response.data?.data?.isWishlisted)
          );
        }
      } catch (error) {
        if (active) {
          console.error('Wishlist check failed:', error);
        }
      }
    };

    checkWishlist();

    return () => {
      active = false;
    };
  }, [product._id]);

  // Add or remove product from wishlist
  const handleWishlist = async () => {
    if (wishlistLoading) return;

    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistError('');

      if (isWishlisted) {
        await wishlistService.remove(product._id);
        setIsWishlisted(false);
      } else {
        await wishlistService.add(product._id);
        setIsWishlisted(true);
      }
    } catch (error) {
      setWishlistError(
        error.response?.data?.message ||
        'Failed to update wishlist.'
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add product to shopping cart
  const handleAddToCart = async () => {
    if (!inStock || addingToCart) return;

    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      setCartError('');

      await cartService.add({
        productId: product._id,
        quantity: 1,
      });

      navigate('/cart');
    } catch (err) {
      setCartError(
        err.response?.data?.message ||
        'Failed to add product to cart.'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">

      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        <Link
          to={productLink}
          aria-label={`View details for ${product.name}`}
          className="block h-full w-full"
        >
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
        </Link>

        {hasDiscount && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-lg bg-orange-600 px-3 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        {/* Working Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          title={
            isWishlisted
              ? 'Remove from Wishlist'
              : 'Add to Wishlist'
          }
          className={`absolute right-3 top-3 rounded-full bg-white p-3 shadow transition hover:scale-110 disabled:cursor-wait disabled:opacity-60 ${
            isWishlisted ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <FiHeart
            size={18}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4">

        <p className="mb-2 text-xs uppercase text-gray-400">
          {product.category?.name || 'Product'}
        </p>

        <Link
          to={productLink}
          className="mb-3 block min-h-12 font-semibold text-gray-900 transition hover:text-orange-600"
        >
          {product.name}
        </Link>

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

        <p
          className={`mb-4 text-xs ${
            inStock ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {inStock ? '● In Stock' : '● Out of Stock'}
        </p>

        {wishlistError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {wishlistError}
          </p>
        )}

        {cartError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {cartError}
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiShoppingCart size={18} />

          {addingToCart
            ? 'Adding...'
            : inStock
              ? 'Add to Cart'
              : 'Out of Stock'}
        </button>

      </div>
    </div>
  );
}

export default ProductCard;
