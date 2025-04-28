import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react';

export default function Layout({ children, darkMode = false }) {
  const [isClient, setIsClient] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setIsClient(true);
    setCurrentPath(window.location.pathname);
  }, []);
  
  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gradient-to-t from-[#080c14] to-[#0f172a] text-text-light' : 'bg-white text-gray-900'}`}>
      <Head>
        <title>BrainBytes AI Tutoring</title>
        <meta name="description" content="AI-powered tutoring platform" />
      </Head>

      <header className={`${darkMode ? 'bg-bg-dark' : 'bg-white'} sticky top-0 z-10 border-b border-border-dark`}>
        <nav className="w-full px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="BrainBytes" className="h-8 w-auto" />
            <h1 className={`text-xl font-semibold ${darkMode ? 'text-text-light' : 'text-gray-900'}`}>BrainBytes</h1>
          </Link>
          {isClient && !currentPath.includes('/login') && !currentPath.includes('/signup') && (
            <div className="relative group">
              <button className="flex items-center focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-hf-blue flex items-center justify-center text-white text-sm font-bold">
                  P
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-bg-dark border border-border-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link href="/" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
                    Dashboard
                  </Link>
                  <Link href="/learning" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
                    Learning
                  </Link>
                  <Link href="/chat" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
                    Chat
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
                    Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
                    Settings
                  </Link>
                  <Link href="/help" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
                    Help
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Floating Chat Portal Avatar - Hidden on chat, login, and signup pages */}
      {isClient && !currentPath.includes('/chat') && 
       !currentPath.includes('/login') && 
       !currentPath.includes('/signup') && (
        <div className="fixed bottom-8 right-8 z-50 group">
          <Link href="/chat" className="flex items-center justify-center w-16 h-34 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="relative w-full h-full">
              <video autoPlay loop muted playsInline className="w-full h-full object-contain">
                <source src="/wave.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-hf-blue/30 mix-blend-overlay"></div>
              <div className="absolute inset-0 border-2 border-hf-blue/50 rounded-[2rem] pointer-events-none shadow-[0_0_15px_5px_rgba(0,119,255,0.3)]"></div>
              <div className="absolute bottom-1 left-1 right-1 h-1 bg-hf-blue/20 rounded-full blur-sm"></div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
