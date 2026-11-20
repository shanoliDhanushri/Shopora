
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { cartService } from '../services/api';

function Cart() {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (value) =>
    `LKR ${Number(value || 0).toLocaleString('en-LK')}`;

  const loadCart = async () => {
    try {
      setError('');
      const response = await cartService.get();
      setCart(response.data.data || { items: [], subtotal: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1 || updating) return;

    try {
      setUpdating(true);
      setError('');
      await cartService.update(itemId, { quantity });
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update quantity.');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (updating) return;

    try {
      setUpdating(true);
      setError('');
      await cartService.remove(itemId);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove item.');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (updating || cart.items.length === 0) return;

    try {
      setUpdating(true);
      setError('');
      await cartService.clear();
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to clear cart.');
    } finally {
      setUpdating(false);
    }
  };

  const items = cart.items || [];
  const totalItems = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="text-3xl font-extrabold text-orange-600">
            Shopora.
          </Link>
          <Link to="/products" className="font-medium text-gray-700 hover:text-orange-600">
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-7 flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FiShoppingCart className="text-orange-600" />
          Shopping Cart
        </h1>

        {error && (
          <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-gray-500">Loading cart...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
            <FiShoppingCart className="mx-auto mb-5 text-gray-300" size={65} />
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-3 text-gray-500">
              Explore our products and add something you like.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-block rounded-xl bg-orange-600 px-8 py-3 font-semibold text-white"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;

                const firstImage = product.images?.[0];
                const image = typeof firstImage === 'string'
                  ? firstImage
                  : firstImage?.url;

                const price = Number(product.price || 0);
                const discount = Number(product.discountPrice || 0);
                const sellingPrice = discount > 0 && discount < price
                  ? discount
                  : price;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm sm:flex-row"
                  >
                    <Link to={`/products/${product._id}`} className="shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-28 w-28 rounded-xl bg-gray-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                          No Image
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div>
                        <Link
                          to={`/products/${product._id}`}
                          className="font-semibold text-gray-900 hover:text-orange-600"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-2 font-bold text-orange-600">
                          {formatPrice(sellingPrice)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center rounded-lg border">
                          <button
                            type="button"
                            disabled={updating || item.quantity <= 1}
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="p-3 disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>
                          <span className="min-w-9 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={updating || item.quantity >= product.stock}
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-3 disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => removeItem(item._id)}
                          className="flex items-center gap-2 text-sm font-medium text-red-500 disabled:opacity-40"
                        >
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                disabled={updating}
                onClick={clearCart}
                className="text-sm font-semibold text-red-500 disabled:opacity-40"
              >
                Clear Cart
              </button>
            </section>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Order Summary</h2>
              <div className="flex justify-between py-3 text-gray-600">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between py-3 text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between py-3 text-gray-600">
                <span>Coupon Discount</span>
                <span>- {formatPrice(cart.couponDiscount)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t pt-5 text-xl font-bold">
                <span>Total</span>
                <span>
                  {formatPrice(
                    Math.max(
                      0,
                      Number(cart.subtotal || 0) -
                      Number(cart.couponDiscount || 0)
                    )
                  )}
                </span>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Shipping charges are calculated at checkout.
              </p>
              <button
                type="button"
                disabled
                className="mt-6 w-full rounded-xl bg-orange-600 py-3 font-semibold text-white opacity-60"
                title="Checkout coming soon"
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
