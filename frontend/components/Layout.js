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
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-text-light hover:bg-bg-dark-secondary">
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

      {/* AI Chat Interface */}
      {isClient && !currentPath.includes('/chat') && 
       !currentPath.includes('/login') && 
       !currentPath.includes('/signup') && (
        <div id="aiChat" className="fixed bottom-6 right-4 sm:right-6 z-50">
          <Link href="/chat">
            <button className="p-2 group scale-75 sm:scale-100 origin-bottom-right" aria-label="Toggle chat window">
              <div className="relative before:content-[''] before:absolute before:inset-[-4px] before:bg-gradient-to-br before:from-purple-500 before:via-purple-600 before:to-purple-400 before:rounded-full before:opacity-50 before:animate-pulse before:blur-sm">
                <div className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-purple-500/10 backdrop-blur-lg px-3 py-2 rounded-xl border border-purple-500/20 text-purple-200 text-sm whitespace-nowrap after:content-[''] after:absolute after:bottom-[-8px] after:right-6 after:border-8 after:border-transparent after:border-t-purple-500/20">
                  Hi! Click to chat with me!
                </div>
                <div className="relative w-22 h-32 group">
                  <video src="/wave.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover rounded-full bg-purple-500/10 backdrop-blur-lg border border-purple-500/20 transition-all duration-500 transform group-hover:scale-110 group-hover:border-purple-500/60 filter group-hover:brightness-110">
                  </video>
                  <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-br from-transparent via-transparent to-purple-900/10"></div>
                </div>
                <div className="absolute -right-1 -bottom-1 animate-[wave_2.5s_ease-in-out_infinite] origin-[70%_70%]">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.97 2.59c-.53-.26-1.17-.15-1.57.27l-3 3.25c-.45.47-.51 1.18-.14 1.72.37.53 1.07.71 1.65.42l1.43-.72V14c0 .55.45 1 1 1s1-.45 1-1V7.53l1.43.72c.58.29 1.28.11 1.65-.42.37-.54.31-1.25-.14-1.72l-3-3.25c-.12-.13-.27-.23-.43-.29zM19 15h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zM5 15H3c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1z"/>
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
