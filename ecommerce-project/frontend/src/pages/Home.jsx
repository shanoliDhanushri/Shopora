
import { useEffect, useState } from 'react'
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiSmartphone,
  FiShoppingBag,
  FiWatch,
  FiHome,
  FiHeadphones,
  FiGift,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowRight,
  FiPackage,
} from 'react-icons/fi'

import { productService } from '../services/api'

const categories = [
  { name: 'Electronics', icon: FiSmartphone },
  { name: 'Fashion', icon: FiShoppingBag },
  { name: 'Accessories', icon: FiWatch },
  { name: 'Home & Living', icon: FiHome },
  { name: 'Audio', icon: FiHeadphones },
  { name: 'Gifts', icon: FiGift },
]

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await productService.getAll()
        setProducts(response.data.data || [])
      } catch {
        setError('Unable to load products.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter((product) =>
    (product.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">

      {/* Announcement Bar */}
      <div className="bg-gray-900 px-4 py-2 text-center text-xs text-white sm:text-sm">
        Welcome to Shopora — Your Everyday Marketplace
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">

          <a href="/" className="text-3xl font-extrabold text-orange-600">
            Shopora.
          </a>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              document.getElementById('products')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="order-last flex w-full items-center rounded-full bg-gray-100 px-5 py-3 md:order-none md:w-2/5"
          >
            <FiSearch className="text-gray-500" />

            <input
              type="search"
              aria-label="Search products"
              placeholder="Search for products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="ml-3 w-full bg-transparent outline-none"
            />
          </form>

          <div className="flex items-center gap-5 text-xl">
            <button aria-label="Account" disabled>
              <FiUser />
            </button>

            <button aria-label="Wishlist" disabled>
              <FiHeart />
            </button>

            <button aria-label="Shopping cart" disabled>
              <FiShoppingCart />
            </button>
          </div>

        </div>

        {/* Navigation Menu */}
        <nav className="mx-auto flex max-w-7xl gap-7 overflow-x-auto whitespace-nowrap px-5 pb-4 text-sm font-medium">

          <a href="/" className="text-orange-600">
            Home
          </a>

          <a href="#categories" className="hover:text-orange-600">
            Categories
          </a>

          <a href="#products" className="hover:text-orange-600">
            Products
          </a>

          <a href="#offers" className="hover:text-orange-600">
            Offers
          </a>

          <a href="#about" className="hover:text-orange-600">
            About Us
          </a>

        </nav>

      </header>

      <main>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-5 py-8">

          <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-orange-50 p-8 md:grid-cols-2 md:p-14">

            <div>
              <span className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700">
                DISCOVER YOUR NEXT FAVOURITE
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
                Discover More.
                <br />
                <span className="text-orange-600">
                  Shop Smarter.
                </span>
              </h1>

              <p className="mt-5 max-w-md leading-relaxed text-gray-600">
                Explore exciting products, discover new
                trends and enjoy a better online shopping
                experience with Shopora.
              </p>

              <a
                href="#products"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-orange-600 px-8 py-4 font-semibold text-white transition hover:bg-orange-700"
              >
                Shop Now <FiArrowRight />
              </a>
            </div>

            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900"
              alt="Featured headphones"
              className="h-72 w-full rounded-2xl object-cover md:h-96"
            />

          </div>

        </section>

        {/* Categories */}
        <section
          id="categories"
          className="mx-auto max-w-7xl scroll-mt-40 px-5 py-8"
        >

          <h2 className="text-2xl font-bold md:text-3xl">
            Shop by Category
          </h2>

          <p className="mt-2 text-gray-500">
            Explore our collections
          </p>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

            {categories.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center rounded-2xl border border-gray-200 p-6 transition hover:border-orange-500 hover:bg-orange-50"
              >
                <div className="mb-4 rounded-full bg-orange-100 p-5 text-3xl text-orange-600">
                  <Icon />
                </div>

                <span className="text-center text-sm font-semibold">
                  {name}
                </span>
              </div>
            ))}

          </div>

        </section>

        {/* Offers */}
        <section
          id="offers"
          className="mx-auto max-w-7xl scroll-mt-40 px-5 py-8"
        >

          <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-gray-900 p-8 text-white md:p-12">

            <div>
              <p className="text-sm font-semibold text-orange-400">
                THE SHOPORA COLLECTION
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Find Something You Love
              </h2>

              <p className="mt-3 text-gray-400">
                Explore our latest product collection.
              </p>
            </div>

            <a
              href="#products"
              className="rounded-full bg-orange-600 px-7 py-3 font-semibold hover:bg-orange-700"
            >
              Explore Products
            </a>

          </div>

        </section>

        {/* Featured Products */}
        <section
          id="products"
          className="mx-auto max-w-7xl scroll-mt-40 px-5 py-10"
        >

          <h2 className="text-2xl font-bold md:text-3xl">
            Featured Products
          </h2>

          <p className="mt-2 text-gray-500">
            Discover products from our collection
          </p>

          {loading && (
            <p className="py-12 text-center text-gray-500">
              Loading products...
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="mt-8 rounded-2xl bg-gray-50 p-12 text-center">

              <FiPackage className="mx-auto mb-4 text-5xl text-gray-400" />

              <h3 className="text-lg font-semibold">
                {search
                  ? 'No matching products'
                  : 'New Products Coming Soon!'}
              </h3>

              <p className="mt-2 text-gray-500">
                {search
                  ? 'Try a different search.'
                  : 'Stay tuned for our latest collection.'}
              </p>

            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

            {filteredProducts.map((product) => {
              const firstImage = product.images?.[0]

              const image =
                typeof firstImage === 'string'
                  ? firstImage
                  : firstImage?.url || product.image

              return (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-lg"
                >

                  <div className="flex h-52 items-center justify-center bg-gray-100">

                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiPackage className="text-4xl text-gray-400" />
                    )}

                  </div>

                  <div className="p-5">

                    <h3 className="font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-lg font-bold text-orange-600">
                      LKR {Number(product.price || 0).toLocaleString('en-LK')}
                    </p>

                    <button
                      disabled
                      className="mt-4 w-full rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Add to Cart
                    </button>

                  </div>

                </article>
              )
            })}

          </div>

        </section>

        {/* Shopping Benefits */}
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-3">

          {[
            { icon: FiTruck, title: 'Delivery Options' },
            { icon: FiShield, title: 'Secure Shopping' },
            { icon: FiRefreshCw, title: 'Customer Support' },
          ].map(({ icon: Icon, title }) => (

            <div
              key={title}
              className="flex items-center gap-4 rounded-xl border border-gray-200 p-6"
            >
              <Icon className="text-3xl text-orange-600" />

              <h3 className="font-semibold">
                {title}
              </h3>
            </div>

          ))}

        </section>

      </main>

      {/* Footer */}
      <footer
        id="about"
        className="mt-10 bg-gray-900 px-5 py-12 text-white"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 md:grid-cols-3">

            <div>
              <h2 className="text-3xl font-extrabold text-orange-500">
                Shopora.
              </h2>

              <p className="mt-4 text-gray-400">
                Your everyday online shopping destination.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Quick Links</h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
                <a href="/">Home</a>
                <a href="#categories">Categories</a>
                <a href="#products">Products</a>
                <a href="#offers">Offers</a>
              </div>
            </div>

            <div>
              <h3 className="font-bold">About Shopora</h3>

              <p className="mt-4 text-sm text-gray-400">
                Discover a new way to shop online.
              </p>
            </div>

          </div>

          <hr className="my-8 border-gray-700" />

          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Shopora.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  )
}

export default Home
