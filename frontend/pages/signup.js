import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';
import PasswordStrength from '../components/PasswordStrength';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      const hasMinLength = formData.password.length >= 8;

      if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters';
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password
      });
      
      // Store token and redirect
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.data.userId);
      router.push('/chat');
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err.response?.data?.message || 'Registration failed'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout darkMode={true}>
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-light mb-6">Sign Up</h1>
        
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
            <PasswordStrength password={formData.password} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-medium mb-1">
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`input bg-bg-dark border-border-dark text-text-light focus:ring-hf-blue focus:border-hf-blue w-full ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
            />
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
                <span className="opacity-0">Sign Up</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <p className="text-text-medium text-center mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-hf-blue hover:text-blue-400">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
