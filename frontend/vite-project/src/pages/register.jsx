import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerApi } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(formData.phone.trim().replace(/[-\s()]/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (7-15 digits)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullname: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim()
      };

      await customerApi.post('/register', payload);

      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in.' }
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen clay-bg flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-[#c8a984] items-center justify-center text-[#26201b] shadow-lg mb-4">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
            Create an Account
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Join ShopKart to start shopping today
          </p>
        </div>

        {/* Minimalist Claymorphic Card (Off-White on Cream) */}
        <div className="clay-card p-8 sm:p-10 transition-all">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 ml-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="e.g. Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm text-stone-900 clay-input"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500 ml-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm text-stone-900 clay-input"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 ml-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="e.g. +1 555-123-4567"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm text-stone-900 clay-input"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm text-stone-900 clay-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="create-account-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 clay-btn-primary text-sm tracking-wide cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-[#26201b]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-6 pt-5 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#a47e53] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}