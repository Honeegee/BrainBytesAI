import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import Layout from '../components/Layout';
import ChatHistory from '../components/ChatHistory';
import withAuth from '../components/withAuth';

function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDeleteChat = async (chatId) => {
    try {
      // Delete chat from database
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats/${chatId}`);
      
      // Update local state
      setChatSessions(prevSessions => prevSessions.filter(chat => chat.id !== chatId));
      
      // If active chat was deleted, switch to another chat
      if (activeChatId === chatId) {
        const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
    }
  };

  const handleUpdateChat = async (chatId, newTitle) => {
    try {
      // Update title in database
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats/${chatId}/title`, {
        title: newTitle
      });
      
      // Update local state
      setChatSessions(prevSessions =>
        prevSessions.map(chat =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );
    } catch (error) {
      console.error('Error updating chat title:', error);
      setError('Failed to update chat title');
    }
  };

  useEffect(() => {
    // Handle chat ID from URL
    const { id } = router.query;
    if (id && chatSessions.find(chat => chat.id === id)) {
      setActiveChatId(id);
    }
  }, [router.query, chatSessions]);

  // Load chats from database on initial mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats`);
        if (response.data && response.data.length > 0) {
          setChatSessions(response.data);
          // If no active chat is set, set the first one as active
          if (!activeChatId && response.data.length > 0) {
            setActiveChatId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
      }
    };

    loadChats();
  }, [activeChatId]);

  useEffect(() => {
    let mounted = true;

    const fetchMessages = async (chatId) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages?chatId=${chatId}`);
        if (mounted) setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (mounted) setError('Failed to load messages. Please try again.');
      }
    };

    const fetchInitialData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/subjects`);
        if (mounted) setSubjects(subjectsResponse.data);

        // Fetch initial messages
        if (activeChatId) {
          await fetchMessages(activeChatId);
        }

        // Fetch user profile if available
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.replace('/login');
          return;
        }
        
        try {
          const profileResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`);
          if (mounted) setUserProfile(profileResponse.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (error.response?.status === 400 || error.response?.status === 404) {
            // Clear invalid auth data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            router.replace('/login');
          }
        }

        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (mounted) {
          setLoading(false);
          setError('Failed to load initial data. Please try refreshing the page.');
        }
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeChatId) {
      setLoading(true);
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages?chatId=${activeChatId}`)
        .then(response => {
          setMessages(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading chat messages:', error);
          setError('Failed to load chat messages');
          setLoading(false);
        });
    }
  }, [activeChatId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    
    try {
      setLoading(true);
      setError('');
      setIsTyping(true);
      
      const tempId = Date.now();
      const isNewChat = !chatSessions.some(chat => chat.id === activeChatId);
      
      // Ensure we have a valid chatId
      if (!activeChatId) {
        throw new Error('No active chat selected');
      }

      // Immediately show user message
      const userMessagePreview = {
        _id: tempId,
        text: newMessage,
        isAiResponse: false,
        createdAt: new Date().toISOString(),
        chatId: activeChatId
      };
      
      setMessages(prevMessages => [...prevMessages, userMessagePreview]);
      
      // Prepare message data with explicit validation
      const messageData = {
        text: newMessage.trim(),
        subject: selectedSubject || '',
        chatId: activeChatId,
        isFirstMessage: isNewChat
      };

      console.log('Sending message with data:', messageData); // Debug log

      // Send message to backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, messageData);
      
      // Handle response
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Refresh chat list to get updated titles
      const chatsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats`);
      setChatSessions(chatsResponse.data);
      
      setNewMessage('');
      
      if (response.data.aiMessage) {
        setMessages(prevMessages => {
          // Keep the optimistic user message, just add AI response
          return [...prevMessages, response.data.aiMessage];
        });
        
        // Update chat title with first message
        if (chatSessions.find(chat => chat.id === activeChatId)?.title === 'New chat') {
          const truncatedMessage = newMessage.slice(0, 30) + (newMessage.length > 30 ? '...' : '');
          await handleUpdateChat(activeChatId, truncatedMessage);
        }
        
      } else {
        throw new Error('Incomplete response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      if (error.response?.data?.userMessage) {
        setMessages(prevMessages => {
          return [...prevMessages, error.response.data.userMessage];
        });
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <Layout darkMode={true}>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        <ChatHistory 
          chats={chatSessions}
          onNewChat={async () => {
            // First clear everything to start fresh immediately
            setMessages([]);
            setSelectedSubject('');
            setNewMessage('');
            setError('');
            
            // Remove any stale "New chat" entries
            const cleanedSessions = chatSessions.filter(chat => chat.title !== 'New chat');
            
            // Generate new chat ID
            const chatId = Date.now().toString();
            
            // Update URL
            router.push('/chat?id=' + chatId, undefined, { shallow: true });
            
            // Add new temporary chat entry
            setChatSessions([{
              id: chatId,
              title: 'New chat',
              createdAt: new Date().toISOString()
            }, ...cleanedSessions]);
            
            setActiveChatId(chatId);
          }}
          activeChatId={activeChatId}
          onDeleteChat={handleDeleteChat}
          onUpdateChat={handleUpdateChat}
        />
        <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-md mb-4 text-center border border-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="max-w-4xl mx-auto space-y-4 px-4">
            {userProfile && (
              <div className="bg-hf-blue bg-opacity-20 p-3 rounded-md mb-4">
                <p className="text-blue-300 text-sm">
                  Welcome back, {userProfile.name}!
                  {selectedSubject && ` Currently discussing: ${selectedSubject}`}
                </p>
              </div>
            )}

            {loading && !messages.length ? (
              <p className="text-text-medium text-center">Loading messages...</p>
            ) : (
              <>
                {messages.length === 0 && !loading && (
                  <p className="text-text-medium text-center">No messages yet. Start the conversation!</p>
                )}
                <ul className="space-y-4 mb-8">
                  {messages
                    .filter(message => message && typeof message === 'object')
                    .map((message) => (
                      <li
                        key={message._id}
                        className={`flex gap-3 ${message.isAiResponse ? 'justify-start' : 'justify-end'}`}
                      >
                        {message.isAiResponse && (
                          <div className="w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Image
                              src="/logo.png"
                              alt="BrainBytes AI"
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              priority
                            />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg max-w-xl shadow-sm ${
                            message.isAiResponse
                              ? 'bg-bg-dark-secondary border border-border-dark text-text-light'
                              : 'bg-hf-blue text-white'
                          }`}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {message.text || 'No message content'}
                          </p>
                          <small className={`block mt-1 text-xs ${message.isAiResponse ? 'text-text-medium' : 'text-blue-200'}`}>
                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No timestamp'}
                          </small>
                        </div>
                        {!message.isAiResponse && (
                          <div className="w-8 h-8 rounded-full bg-hf-yellow text-text-dark flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                            {userProfile?.profileImage ? (
                            <Image
                              src={userProfile.profileImage}
                              alt={userProfile.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              priority
                            />
                            ) : (
                              <span>{userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
                <div ref={messagesEndRef} />
                {isTyping && (
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src="/logo.png"
                        alt="BrainBytes AI"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <div className="p-3 rounded-lg max-w-xl shadow-sm bg-bg-dark-secondary border border-border-dark">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-text-medium rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-text-medium rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-text-medium rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-2 py-2">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message BrainBytes..."
                  className="input bg-bg-dark-secondary border border-border-dark text-text-light flex-1 resize-none text-base py-3 px-4 rounded-xl focus:ring-hf-blue focus:border-hf-blue placeholder-text-medium pr-12"
                  rows="3"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault(); 
                      handleSubmit(e);    
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className={`absolute right-3 bottom-3 bg-hf-blue hover:bg-blue-700 text-white p-2 rounded-full transition-colors ${
                    (loading || !newMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
                <div className="absolute bottom-4 left-0 px-4">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-bg-dark-secondary border border-border-dark text-text-light text-xs focus:ring-hf-blue focus:border-hf-blue h-8 pl-3 pr-6 py-1 rounded-full w-30"
                  >
                    <option value="" className="text-text-medium">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject} className="text-text-light bg-bg-dark">{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
  );
}

export default withAuth(Chat);
