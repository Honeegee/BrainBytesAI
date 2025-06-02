import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children, darkMode = false }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`
      );
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear client-side state even if backend logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/login');
    }
  };

  const [isClient, setIsClient] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentPath(window.location.pathname);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${darkMode ? 'bg-gradient-to-t from-[#080c14] to-[#0f172a] text-text-light' : 'bg-white text-gray-900'}`}
    >
      <Toaster
        position='top-right'
        toastOptions={{
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#e2e8f0' : '#1e293b',
          },
        }}
      />
      <Head>
        <title>BrainBytes AI Tutoring</title>
        <meta name='description' content='AI-powered tutoring platform' />
      </Head>

      <header
        className={`${darkMode ? 'bg-bg-dark' : 'bg-white'} sticky top-0 z-20 border-b border-border-dark`}
      >
        <nav className='w-full px-4 py-3 flex items-center justify-between'>
          <Link href='/' className='flex items-center space-x-2'>
            <img src='/logo.png' alt='BrainBytes' className='h-8 w-auto' />
            <h1
              className={`text-xl font-semibold ${darkMode ? 'text-text-light' : 'text-gray-900'}`}
            >
              BrainBytes
            </h1>
          </Link>
          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            {isClient &&
              !currentPath.includes('/login') &&
              !currentPath.includes('/signup') && (
                <button
                  onClick={toggleMobileMenu}
                  className={`p-2 rounded-md ${darkMode ? 'text-text-light hover:bg-bg-dark-secondary' : 'text-gray-900 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-inset ${darkMode ? 'focus:ring-hf-blue' : 'focus:ring-primary'}`}
                  aria-label='Toggle menu'
                >
                  {isMobileMenuOpen ? (
                    <svg
                      className='h-6 w-6'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='h-6 w-6'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M4 6h16M4 12h16m-7 6h7'
                      />
                    </svg>
                  )}
                </button>
              )}
          </div>
          {/* Desktop Navigation Links */}
          <div className='hidden md:flex items-center space-x-4'>
            {isClient &&
              !currentPath.includes('/login') &&
              !currentPath.includes('/signup') && (
                <>
                  <Link
                    href='/dashboard'
                    className={`text-sm ${darkMode ? 'text-text-light hover:text-hf-blue' : 'text-gray-900 hover:text-hf-blue'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href='/learning'
                    className={`text-sm ${darkMode ? 'text-text-light hover:text-hf-blue' : 'text-gray-900 hover:text-hf-blue'}`}
                  >
                    Learning
                  </Link>
                  <Link
                    href='/chat'
                    className={`text-sm ${darkMode ? 'text-text-light hover:text-hf-blue' : 'text-gray-900 hover:text-hf-blue'}`}
                  >
                    Chat
                  </Link>
                  <Link
                    href='/profile'
                    className={`text-sm ${darkMode ? 'text-text-light hover:text-hf-blue' : 'text-gray-900 hover:text-hf-blue'}`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`text-sm ${darkMode ? 'text-text-light hover:text-hf-blue' : 'text-gray-900 hover:text-hf-blue'}`}
                  >
                    Logout
                  </button>
                </>
              )}
          </div>
        </nav>
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen &&
          isClient &&
          !currentPath.includes('/login') &&
          !currentPath.includes('/signup') && (
            <div
              className={`md:hidden absolute top-full left-0 right-0 ${darkMode ? 'bg-bg-dark' : 'bg-white'} border-b border-border-dark shadow-lg py-2`}
            >
              <Link
                href='/dashboard'
                className={`block px-4 py-2 text-sm ${darkMode ? 'text-text-light hover:bg-bg-dark-secondary' : 'text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href='/learning'
                className={`block px-4 py-2 text-sm ${darkMode ? 'text-text-light hover:bg-bg-dark-secondary' : 'text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Learning
              </Link>
              <Link
                href='/chat'
                className={`block px-4 py-2 text-sm ${darkMode ? 'text-text-light hover:bg-bg-dark-secondary' : 'text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chat
              </Link>
              <Link
                href='/profile'
                className={`block px-4 py-2 text-sm ${darkMode ? 'text-text-light hover:bg-bg-dark-secondary' : 'text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-text-light hover:bg-bg-dark-secondary' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                Logout
              </button>
            </div>
          )}
      </header>

      <main className='flex-1'>{children}</main>

      {/* AI Chat Interface */}
      {isClient &&
        !currentPath.includes('/chat') &&
        !currentPath.includes('/login') &&
        !currentPath.includes('/signup') && (
          <div id='aiChat' className='fixed bottom-6 right-4 sm:right-6 z-50'>
            <Link href='/chat'>
              <button
                className='p-2 group scale-60 sm:scale-80 origin-bottom-right'
                aria-label='Toggle chat window'
              >
                <div className="relative before:content-[''] before:absolute before:inset-[-4px] before:bg-gradient-to-br before:from-sky-500 before:via-sky-600 before:to-sky-400 before:rounded-full before:opacity-50 before:animate-pulse before:blur-sm">
                  <div className="hidden sm:block absolute -top-10 right-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-sky-500/10 backdrop-blur-lg px-3 py-2 rounded-xl border border-sky-500/20 text-sky-200 text-sm whitespace-nowrap after:content-[''] after:absolute after:bottom-[-8px] after:right-6 after:border-8 after:border-transparent after:border-t-sky-500/20">
                    Hi! Click to chat with me!
                  </div>
                  <div className='relative w-14 h-20 group'>
                    {' '}
                    {/* Reduced size */}
                    <video
                      src='/wave.mp4'
                      autoPlay
                      loop
                      muted
                      playsInline
                      className='w-16 h-20 object-cover rounded-full bg-sky-500/10 backdrop-blur-lg border border-sky-500/20 transition-all duration-500 transform group-hover:scale-110 group-hover:border-sky-500/60 filter group-hover:brightness-110'
                    >
                      {' '}
                      {/* Reduced size */}
                    </video>
                    <div className='absolute inset-0 rounded-full pointer-events-none bg-gradient-to-br from-transparent via-transparent to-sky-900/10'></div>
                  </div>
                  <div className='absolute -right-1 -bottom-1 animate-[wave_2.5s_ease-in-out_infinite] origin-[70%_70%]'>
                    <svg
                      className='w-5 h-5 text-sky-400'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12.97 2.59c-.53-.26-1.17-.15-1.57.27l-3 3.25c-.45.47-.51 1.18-.14 1.72.37.53 1.07.71 1.65.42l1.43-.72V14c0 .55.45 1 1 1s1-.45 1-1V7.53l1.43.72c.58.29 1.28.11 1.65-.42.37-.54.31-1.25-.14-1.72l-3-3.25c-.12-.13-.27-.23-.43-.29zM19 15h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zM5 15H3c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1z' />
                    </svg>
                  </div>
                </div>
              </button>
            </Link>
          </div>
        )}
    </div>
  );
}
