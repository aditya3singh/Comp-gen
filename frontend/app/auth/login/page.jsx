'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail } from '@/utils/helpers';
import { Eye, EyeOff, Loader2, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log('Form submitted via JavaScript handler');
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('Calling login with:', formData.email);
    const success = await login(formData.email, formData.password, formData.rememberMe);
    if (success) {
      router.push('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30"></div>
      
      <div className="w-full max-w-md relative">
        {/* Main Card */}
        <div className="card p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-3xl mb-4 shadow-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Welcome Back
            </h1>
            <p className="text-neutral-600 mt-2">
              Sign in to continue building amazing components
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-neutral-700 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input ${
                    errors.email 
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500' 
                      : ''
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="absolute -bottom-6 left-0">
                    <p className="text-sm text-error-600 flex items-center">
                      <span className="w-1 h-1 bg-error-600 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 pt-2">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-700 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-primary-600" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input pr-12 ${
                    errors.password 
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500' 
                      : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <div className="absolute -bottom-6 left-0">
                    <p className="text-sm text-error-600 flex items-center">
                      <span className="w-1 h-1 bg-error-600 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary btn-lg interactive"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 gradient-primary rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 gradient-primary rounded-full opacity-15 blur-xl"></div>
      </div>
    </div>
  );
}