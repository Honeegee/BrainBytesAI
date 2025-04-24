import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`);
      console.log('Fetched messages:', response.data); 
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  // Submit a new message and get AI response
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setLoading(true);
      console.log('Sending message:', newMessage); // Add logging
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, { text: newMessage });
      console.log('Response:', response.data); // Add logging
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>BrainBytes Chat</h1>
      
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
      
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div>
          {messages.length === 0 ? (
            <p>No messages yet. Be the first to say something!</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {messages.map((message) => (
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
                  {message.isAiResponse && (
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
                  <p>{message.text}</p>
                  <small>{new Date(message.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
