module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-in-out',
        'expand': 'expand 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        expand: {
          '0%': { opacity: '0', height: '0', padding: '0' },
          '100%': { opacity: '1', height: 'auto', padding: '0.75rem' },
        },
      },
      colors: {
        primary: {
          DEFAULT: '#0070f3',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a7f7',
          500: '#0070f3',
          600: '#0058df',
          700: '#0045b5',
          800: '#003993',
          900: '#002f78',
        },
        success: {
          DEFAULT: '#38a169',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#38a169',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        error: {
          DEFAULT: '#e53e3e',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#e53e3e',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'hf-yellow': '#FFD21E',
        'hf-gray-light': '#F3F4F6',
        'hf-gray-medium': '#D1D5DB', 
        'hf-gray-dark': '#4B5563',   
        'hf-blue': '#3B82F6',       
        // Dark Theme Colors
        'bg-darkest': '#1a202c',    
        'bg-dark': '#0F172A',       
        'bg-dark-secondary': '#121C2D', 
        'border-dark': '#334155',   
        'text-light': '#F1F5F9',    
        'text-medium': '#94A3B8',   
        'text-dark': '#0F172A',     
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
