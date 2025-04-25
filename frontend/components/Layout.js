import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>BrainBytes AI Tutoring</title>
        <meta name="description" content="AI-powered tutoring platform for Filipino students" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="wrapper">
        <header>
          <nav>
            <div className="logo">BrainBytes</div>
            <div className="nav-links">
              <Link href="/">
                <a>Chat</a>
              </Link>
              <Link href="/dashboard">
                <a>Dashboard</a>
              </Link>
              <Link href="/profile">
                <a>Profile</a>
              </Link>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <p>© 2025 BrainBytes AI Tutoring. All rights reserved.</p>
        </footer>
      </div>

      <style jsx>{`
        .wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        header {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0070f3;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          color: #333;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .nav-links a:hover {
          background-color: #f0f0f0;
          color: #0070f3;
        }

        main {
          flex: 1;
          padding: 2rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        footer {
          background-color: #f7f7f7;
          padding: 1rem;
          text-align: center;
          margin-top: auto;
        }

        footer p {
          margin: 0;
          color: #666;
        }
      `}</style>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
