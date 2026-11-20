
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(form);
      const user = response.data.data;

      if (!user?.token) {
        throw new Error('Login response is missing a token.');
      }

      localStorage.setItem('token', user.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );

      navigate('/products');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">

        <Link
          to="/"
          className="block text-center text-3xl font-extrabold text-orange-600"
        >
          Shopora.
        </Link>

        <h1 className="mt-7 text-center text-2xl font-bold">
          Welcome Back!
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          Login to your Shopora account
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3 font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-orange-600"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
