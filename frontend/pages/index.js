import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/subjects`);
        if (mounted) setSubjects(subjectsResponse.data);

        // Fetch messages
        const messagesResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
        if (mounted) setMessages(messagesResponse.data);

        // Fetch user profile if available
        const userId = localStorage.getItem('userId');
        if (userId) {
          const profileResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`);
          if (mounted) setUserProfile(profileResponse.data);
        }

        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (mounted) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  // Submit a new message and get AI response
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      try {
        setLoading(true);
        console.log('Sending message:', newMessage);
        console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
        
        const messageData = {
          text: newMessage,
          subject: selectedSubject
        };
        
        console.log('Sending request with data:', messageData);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, messageData);
        console.log('Received response:', response.data);
        
        setNewMessage('');
        console.log('Updating messages with response:', response.data);
        if (response.data.userMessage && response.data.aiMessage) {
          setMessages(prevMessages => {
            const updatedMessages = [response.data.userMessage, response.data.aiMessage, ...prevMessages];
            console.log('Updated messages state:', updatedMessages);
            return updatedMessages;
          });
          // Scroll to top to show new messages
          window.scrollTo(0, 0);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Received invalid response format from server');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      setError(error.response?.data?.error || 'Failed to send message. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>BrainBytes Chat</h1>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <a href="/dashboard" style={{ color: '#0070f3', textDecoration: 'none' }}>Dashboard</a>
          <a href="/profile" style={{ color: '#0070f3', textDecoration: 'none' }}>Profile</a>
        </nav>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <select 
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ 
            width: '200px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '80%', padding: '8px' }}
        />
        <button 
          type="submit" 
          style={{ 
            marginLeft: '10px', 
            padding: '8px 15px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Send
        </button>
      </form>
      
      {userProfile && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0 }}>
            Welcome back, {userProfile.name}! 
            {selectedSubject && ` Currently discussing: ${selectedSubject}`}
          </p>
        </div>
      )}

      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div>
          {messages.length === 0 ? (
            <p>No messages yet. Be the first to say something!</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {messages.filter(message => message && typeof message === 'object').map((message) => (
                <li 
                  key={message._id} 
                  style={{ 
                    padding: '10px', 
                    margin: '10px 0', 
                    backgroundColor: message.isAiResponse ? '#e3f2fd' : '#f0f0f0',
                    borderRadius: '5px',
                    marginLeft: message.isAiResponse ? '20px' : '0',
                    marginRight: message.isAiResponse ? '0' : '20px',
                    position: 'relative'
                  }}
                >
                  {message && message.isAiResponse && (
                    <div style={{ 
                      position: 'absolute',
                      left: '-25px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '4px',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      AI
                    </div>
                  )}
                  <p>{message.text || 'No message content'}</p>
                  <small>{message.createdAt ? new Date(message.createdAt).toLocaleString() : 'No timestamp'}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
