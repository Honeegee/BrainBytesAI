import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      router.replace('/chat');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.data.userId);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
      }
      
      router.push('/chat');
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err.response?.data?.message || 'Login failed'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout darkMode={true}>
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-light mb-6">Login</h1>
        
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-md mb-4">
            <ul className="list-disc list-inside space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`input bg-bg-dark border-border-dark text-text-light focus:ring-hf-blue focus:border-hf-blue w-full ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-medium mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`input bg-bg-dark border-border-dark text-text-light focus:ring-hf-blue focus:border-hf-blue w-full ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-hf-blue rounded border-border-dark focus:ring-hf-blue bg-bg-dark"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-text-medium">
                Remember me
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn bg-hf-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full relative ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Login</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Login'
            )}
          </button>

          <p className="text-text-medium text-center mt-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-hf-blue hover:text-blue-400">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
