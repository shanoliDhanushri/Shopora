
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiImage,
  FiPackage,
  FiShoppingCart,
} from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { productService, cartService } from '../services/api';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchProduct() {
      setLoading(true);
      setError('');
      setProduct(null);
      setSelectedImage(0);
      setImageError(false);
      setQuantity(1);
      setCartMessage('');

      try {
        const response = await productService.getById(id);
        const result = response.data;
        const fetchedProduct = result?.data || result?.product;

        if (!fetchedProduct || !fetchedProduct._id) {
          throw new Error('Product data is unavailable.');
        }

        if (active) {
          setProduct(fetchedProduct);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Unable to load product.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || addingToCart || Number(product.stock) < quantity) {
      return;
    }

    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage('');

      await cartService.add({
        productId: product._id,
        quantity,
      });

      navigate('/cart');
    } catch (err) {
      setCartMessage(
        err.response?.data?.message ||
        err.message ||
        'Failed to add product to cart.'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 text-center">
        <p className="text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 text-center">
        <FiPackage className="mx-auto mb-4 text-5xl text-gray-400" />

        <h1 className="text-2xl font-bold">
          Product Unavailable
        </h1>

        <p className="mt-3 text-gray-500">
          {error || 'Product not found.'}
        </p>

        <Link
          to="/products"
          className="mt-6 inline-block text-orange-600 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const images = (product.images || [])
    .map((image) =>
      typeof image === 'string' ? image : image?.url
    )
    .filter(Boolean);

  const price = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice || 0);

  const hasDiscount =
    discountPrice > 0 && discountPrice < price;

  const sellingPrice = hasDiscount ? discountPrice : price;
  const stock = Number(product.stock || 0);

  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const specifications = product.specifications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            to="/"
            className="text-3xl font-extrabold text-orange-600"
          >
            Shopora.
          </Link>

          <div className="flex items-center gap-5">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600"
            >
              <FiShoppingCart />
              Cart
            </Link>

            <Link
              to="/products"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600"
            >
              <FiArrowLeft />
              Back to Products
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-orange-600">
            Home
          </Link>
          {' / '}
          <Link to="/products" className="hover:text-orange-600">
            Products
          </Link>
          {' / '}
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid gap-10 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
          {/* Product Images */}
          <div>
            <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 sm:h-[450px]">
              {images[selectedImage] && !imageError ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <FiImage className="text-7xl text-gray-300" />
              )}

              {hasDiscount && (
                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImage(index);
                      setImageError(false);
                    }}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                      selectedImage === index
                        ? 'border-orange-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              {product.category?.name || 'Shopora Collection'}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
              {product.name}
            </h1>

            {product.brand && (
              <p className="mt-3 text-gray-500">
                Brand: {product.brand}
              </p>
            )}

            <div className="mt-5 flex items-center gap-2">
              <FaStar className="text-yellow-400" />

              <span className="font-semibold">
                {Number(product.ratings || 0).toFixed(1)}
              </span>

              <span className="text-sm text-gray-500">
                ({product.numReviews || 0} reviews)
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-extrabold text-orange-600">
                LKR {sellingPrice.toLocaleString('en-LK')}
              </span>

              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">
                  LKR {price.toLocaleString('en-LK')}
                </span>
              )}
            </div>

            <div className="mt-6">
              {stock > 0 ? (
                <p className="flex items-center gap-2 font-medium text-green-600">
                  <FiCheckCircle />
                  In Stock ({stock} available)
                </p>
              ) : (
                <p className="font-medium text-red-600">
                  Out of Stock
                </p>
              )}
            </div>

            <p className="mt-6 leading-7 text-gray-600">
              {product.shortDescription ||
                product.description ||
                'No description available.'}
            </p>

            {/* Quantity Selector */}
            <div className="mt-8">
              <p className="mb-3 font-semibold">Quantity</p>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-300">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  disabled={stock === 0 || quantity <= 1 || addingToCart}
                  className="px-5 py-3 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="px-5 font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.min(stock, previous + 1)
                    )
                  }
                  disabled={stock === 0 || quantity >= stock || addingToCart}
                  className="px-5 py-3 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cart Error Message */}
            {cartMessage && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600"
              >
                {cartMessage}
              </p>
            )}

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock === 0 || addingToCart}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiShoppingCart />
              {addingToCart
                ? 'Adding to Cart...'
                : stock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Description and Specifications */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold">
              Product Description
            </h2>

            <p className="mt-5 whitespace-pre-line leading-7 text-gray-600">
              {product.description || 'No description available.'}
            </p>
          </section>

          <section className="rounded-3xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold">
              Specifications
            </h2>

            {specifications.length > 0 ? (
              <div className="mt-5 divide-y divide-gray-100">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between gap-4 py-3"
                  >
                    <span className="font-medium text-gray-600">
                      {spec.key}
                    </span>

                    <span className="text-right text-gray-900">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-gray-500">
                No specifications available.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;
