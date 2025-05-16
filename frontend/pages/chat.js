import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import Layout from '../components/Layout';
import ChatHistory from '../components/ChatHistory';
import withAuth from '../components/withAuth';

// Import react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats/${chatId}`);
      setChatSessions(prevSessions => prevSessions.filter(chat => chat.id !== chatId));
      
      if (activeChatId === chatId) {
        const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }

      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
      toast.error('Failed to delete chat');
    }
  };

  const handleUpdateChat = async (chatId, newTitle) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats/${chatId}/title`, {
        title: newTitle
      });
      
      setChatSessions(prevSessions =>
        prevSessions.map(chat =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );

      toast.success('Chat title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      setError('Failed to update chat title');
      toast.error('Failed to update chat title');
    }
  };

  useEffect(() => {
    const { id } = router.query;
    if (id && chatSessions.find(chat => chat.id === id)) {
      setActiveChatId(id);
    }
  }, [router.query, chatSessions]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats`);
        if (response.data && response.data.length > 0) {
          setChatSessions(response.data);
          if (!activeChatId && response.data.length > 0) {
            setActiveChatId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
        toast.error('Failed to load chat history');
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
        if (mounted) {
          setError('Failed to load messages. Please try again.');
          toast.error('Failed to load messages.');
        }
      }
    };

    const fetchInitialData = async () => {
      try {
        const subjectsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/subjects`);
        if (mounted) setSubjects(subjectsResponse.data);

        if (activeChatId) {
          await fetchMessages(activeChatId);
        }

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
          toast.error('Failed to load initial data');
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
          toast.error('Failed to load chat messages');
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

      if (!activeChatId) {
        throw new Error('No active chat selected');
      }

      const userMessagePreview = {
        _id: tempId,
        text: newMessage,
        isAiResponse: false,
        createdAt: new Date().toISOString(),
        chatId: activeChatId
      };
      
      setMessages(prevMessages => [...prevMessages, userMessagePreview]);
      
      const messageData = {
        text: newMessage.trim(),
        subject: selectedSubject || '',
        chatId: activeChatId,
        isFirstMessage: isNewChat
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, messageData);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      const chatsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/chats`);
      setChatSessions(chatsResponse.data);
      
      setNewMessage('');
      
      if (response.data.aiMessage) {
        setMessages(prevMessages => [...prevMessages, response.data.aiMessage]);
        
        if (chatSessions.find(chat => chat.id === activeChatId)?.title === 'New chat') {
          const truncatedMessage = newMessage.slice(0, 30) + (newMessage.length > 30 ? '...' : '');
          await handleUpdateChat(activeChatId, truncatedMessage);
        }
        
        toast.success('Message sent successfully');
      } else {
        throw new Error('Incomplete response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      toast.error(error.message || 'Failed to send message');
      
      if (error.response?.data?.userMessage) {
        setMessages(prevMessages => [...prevMessages, error.response.data.userMessage]);
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
            setMessages([]);
            setSelectedSubject('');
            setNewMessage('');
            setError('');
            const cleanedSessions = chatSessions.filter(chat => chat.title !== 'New chat');
            const chatId = Date.now().toString();
            router.push('/chat?id=' + chatId, undefined, { shallow: true });
            setActiveChatId(chatId);
            setChatSessions([{ id: chatId, title: 'New chat' }, ...cleanedSessions]);
          }}
          onDeleteChat={handleDeleteChat}
          onUpdateChat={handleUpdateChat}
          onSelectChat={id => {
            router.push('/chat?id=' + id, undefined, { shallow: true });
            setActiveChatId(id);
            setError('');
          }}
          activeChatId={activeChatId}
        />
        
        <main className="flex-1 flex flex-col bg-gray-800 overflow-hidden">
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
            {loading && <div className="text-center text-white">Loading...</div>}

            {!loading && messages.length === 0 && (
              <div className="text-center text-white mt-6">
                No messages yet. Start chatting!
              </div>
            )}

            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex items-start gap-4 ${
                    message.isAiResponse ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-900">
                    <Image
                      fill
                      alt={message.isAiResponse ? 'Assistant' : 'User'}
                      src={
                        message.isAiResponse
                          ? '/images/assistant_avatar.png'
                          : userProfile?.avatar || '/images/default_avatar.png'
                      }
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <p className="text-white whitespace-pre-wrap">{message.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-900">
                    <Image
                      fill
                      alt="Assistant"
                      src="/images/assistant_avatar.png"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <p className="text-white">Typing...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-gray-900 flex gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 rounded bg-gray-700 text-white"
              placeholder="Type your message"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading || !newMessage.trim()}
            >
              Send
            </button>
          </form>

          {error && (
            <div className="text-red-500 text-center p-2">
              {error}
            </div>
          )}
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Layout>
  );
}

export default withAuth(Chat);
