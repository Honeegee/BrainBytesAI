import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [recentMessages, setRecentMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent messages
        const messagesResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
        setRecentMessages(messagesResponse.data.slice(0, 5)); // Get last 5 messages

        // TODO: Replace with actual user ID once authentication is implemented
        const userId = localStorage.getItem('userId');
        if (userId) {
          const profileResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`);
          setUserProfile(profileResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <header>
        <h1>Learning Dashboard</h1>
        <nav>
          <a href="/" className="nav-link">Chat</a>
          <a href="/profile" className="nav-link">Profile</a>
        </nav>
      </header>

      <main>
        <section className="welcome-section">
          <h2>Welcome{userProfile ? `, ${userProfile.name}` : ''}!</h2>
          {!userProfile && (
            <p>
              Please <a href="/profile">complete your profile</a> to personalize your learning experience.
            </p>
          )}
        </section>

        <section className="activity-section">
          <h3>Recent Activity</h3>
          <div className="messages-list">
            {recentMessages.map((message) => (
              <div key={message._id} className={`message ${message.isAiResponse ? 'ai' : 'user'}`}>
                <p>{message.text}</p>
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </section>

        {userProfile && (
          <section className="subjects-section">
            <h3>Your Subjects</h3>
            <div className="subjects-grid">
              {userProfile.preferredSubjects.map((subject) => (
                <div key={subject} className="subject-card">
                  {subject}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        nav {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          color: #0070f3;
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 4px;
        }
        .nav-link:hover {
          background-color: #f0f0f0;
        }
        section {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .message {
          padding: 10px;
          border-radius: 4px;
          background-color: #f0f0f0;
        }
        .message.ai {
          background-color: #e3f2fd;
          margin-left: 20px;
        }
        .message.user {
          background-color: #f5f5f5;
          margin-right: 20px;
        }
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .subject-card {
          padding: 15px;
          background-color: #e3f2fd;
          border-radius: 4px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        small {
          color: #666;
          font-size: 0.8em;
        }
      `}</style>
    </div>
  );
}
