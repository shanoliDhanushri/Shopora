
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { wishlistService, cartService } from '../services/api';

function Wishlist() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await wishlistService.get();
      setProducts(response.data?.data?.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load wishlist.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }

    loadWishlist();
  }, [navigate]);

  const removeProduct = async (productId) => {
    try {
      setBusyId(productId);
      setError('');

      await wishlistService.remove(productId);

      setProducts((current) =>
        current.filter((product) => product._id !== productId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to remove product.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const addToCart = async (product) => {
    try {
      setBusyId(product._id);
      setError('');

      await cartService.add({
        productId: product._id,
        quantity: 1,
      });

      navigate('/cart');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to add product to cart.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const formatPrice = (value) =>
    `LKR ${Number(value || 0).toLocaleString('en-LK')}`;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/products"
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          ← Continue Shopping
        </Link>

        <div className="mb-8 mt-5 flex items-center gap-3">
          <FiHeart size={30} className="text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            My Wishlist
          </h1>
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-gray-500">Loading wishlist...</p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <FiHeart
              size={48}
              className="mx-auto mb-4 text-gray-300"
            />

            <h2 className="text-xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Save your favorite products here.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const firstImage = product.images?.[0];
              const image =
                typeof firstImage === 'string'
                  ? firstImage
                  : firstImage?.url;

              const price = Number(product.price || 0);
              const discount = Number(product.discountPrice || 0);
              const sellingPrice =
                discount > 0 && discount < price
                  ? discount
                  : price;

              const inStock = Number(product.stock) > 0;
              const busy = busyId === product._id;

              return (
                <div
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-xs uppercase text-gray-400">
                      {product.category?.name || 'Product'}
                    </p>

                    <Link
                      to={`/products/${product._id}`}
                      className="mt-2 block font-semibold text-gray-900 hover:text-orange-600"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-3 text-lg font-bold text-orange-600">
                      {formatPrice(sellingPrice)}
                    </p>

                    <p
                      className={`mt-2 text-sm ${
                        inStock ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={!inStock || busy}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                      >
                        <FiShoppingCart />
                        {busy ? 'Please wait...' : 'Add to Cart'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeProduct(product._id)}
                        disabled={busy}
                        title="Remove from Wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="rounded-xl border border-red-200 px-4 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
