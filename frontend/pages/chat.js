import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Image from 'next/image';
import api from '../lib/api';
import Layout from '../components/Layout';
import ChatHistory from '../components/ChatHistory';
import withAuth from '../components/withAuth';
import ChatMessageContent from '../components/ChatMessageContent';

function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [refreshSubjectsKey, setRefreshSubjectsKey] = useState(0);
  const [error, setError] = useState('');
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatSubjects, setChatSubjects] = useState({}); // Store subjects per chat
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteChat = async chatId => {
    try {
      await api.delete(`/api/messages/chats/${chatId}`);

      // Update local state
      setChatSessions(prevSessions =>
        prevSessions.filter(chat => chat.id !== chatId)
      );

      // Remove stored subject for deleted chat
      setChatSubjects(prev => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      if (activeChatId === chatId) {
        const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
          // Load subject for the next active chat if exists
          setSelectedSubject(chatSubjects[remainingChats[0].id] || '');
        } else {
          setActiveChatId(null);
          setMessages([]);
          setSelectedSubject('');
        }
      }

      toast.success('Chat successfully deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
      toast.error('Failed to delete chat');
    }
  };

  const handleUpdateChat = async (chatId, newTitle) => {
    try {
      // Update title in database
      await api.put(`/api/messages/chats/${chatId}/title`, {
        title: newTitle,
      });

      setChatSessions(prevSessions =>
        prevSessions.map(chat =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );

      toast.success('Chat title updated!');
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

  // Load chats from database and auto-refresh every 30 seconds
  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await api.get(`/api/messages/chats`);
        if (response.data && response.data.length > 0) {
          setChatSessions(response.data);
          if (!activeChatId && response.data.length > 0) {
            setActiveChatId(response.data[0].id);
            // Load stored subject for this chat if exists
            if (chatSubjects[response.data[0].id]) {
              setSelectedSubject(chatSubjects[response.data[0].id]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
        toast.error('Failed to load chat history');
      }
    };

    // Load chats immediately on mount
    loadChats();

    // Set up auto-refresh interval
    const interval = setInterval(loadChats, 30000); // Refresh every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [activeChatId, router, chatSubjects]);

  useEffect(() => {
    let mounted = true;

    const fetchMessages = async chatId => {
      try {
        const response = await api.get(
          `/api/messages?chatId=${chatId}${selectedSubject ? `&subject=${selectedSubject}` : ''}`
        );
        if (mounted) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (mounted) {
          setError('Failed to load messages. Please try again.');
        }
      }
    };

    const fetchSubjects = async () => {
      try {
        const subjectsResponse = await api.get(`/api/materials/subjects`);
        if (mounted) {
          setSubjects(subjectsResponse.data);
          // If selected subject no longer exists, reset it
          if (
            selectedSubject &&
            !subjectsResponse.data.includes(selectedSubject)
          ) {
            setSelectedSubject('');
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    const fetchInitialData = async () => {
      try {
        await fetchSubjects();

        if (activeChatId) {
          await fetchMessages(activeChatId);
        }

        try {
          const userId = localStorage.getItem('userId');
          if (userId) {
            const profileResponse = await api.get(`/api/users/${userId}`);
            if (mounted) setUserProfile(profileResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }

        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (mounted) {
          setLoading(false);
          setError(
            'Failed to load initial data. Please try refreshing the page.'
          );
          toast.error('Failed to load initial data');
        }
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, [refreshSubjectsKey, activeChatId, selectedSubject]);

  // Refresh subjects list every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshSubjectsKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (activeChatId) {
        setLoading(true);
        try {
          // Load stored subject for this chat if exists
          const chatSubject = chatSubjects[activeChatId] || '';
          setSelectedSubject(chatSubject);

          const response = await api.get(
            `/api/messages?chatId=${activeChatId}${chatSubject ? `&subject=${chatSubject}` : ''}`
          );
          setMessages(response.data.messages);
        } catch (error) {
          console.error('Error loading chat messages:', error);
          setError('Failed to load chat messages');
        } finally {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadMessages();

    // Set up auto-refresh for messages
    const interval = setInterval(async () => {
      if (activeChatId) {
        try {
          const response = await api.get(
            `/api/messages?chatId=${activeChatId}${selectedSubject ? `&subject=${selectedSubject}` : ''}`
          );
          setMessages(response.data.messages);
        } catch (error) {
          console.error('Error refreshing messages:', error);
        }
      }
    }, 15000); // Refresh every 15 seconds

    // Cleanup interval on unmount or when activeChatId/selectedSubject changes
    return () => clearInterval(interval);
  }, [activeChatId, selectedSubject, chatSubjects]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();

    try {
      setLoading(true);
      setError('');
      setIsTyping(true);
      setNewMessage('');

      let currentChatId = activeChatId;

      // If no active chat, create one
      if (!currentChatId) {
        currentChatId = Date.now().toString();
        // Update chat sessions first
        setChatSessions(prev => [
          {
            id: currentChatId,
            title: 'New chat',
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setActiveChatId(currentChatId);
        router.push('/chat?id=' + currentChatId, undefined, { shallow: true });
      }

      const tempId = Date.now();
      const isNewChat = !chatSessions.some(chat => chat.id === currentChatId);

      const userMessagePreview = {
        _id: tempId,
        text: messageContent,
        isAiResponse: false,
        createdAt: new Date().toISOString(),
        chatId: currentChatId,
      };

      setMessages(prevMessages => [...prevMessages, userMessagePreview]);

      const messageData = {
        text: messageContent,
        subject: selectedSubject || '',
        chatId: currentChatId,
        isFirstMessage: isNewChat,
      };

      // console.log('Sending message with data:', messageData); // Debug log

      // Send message to backend
      const response = await api.post(`/api/messages`, messageData);

      if (response.data.error) {
        setNewMessage(messageContent); // Restore message if error
        throw new Error(response.data.error);
      }

      // Refresh chat list to get updated titles
      const chatsResponse = await api.get(`/api/messages/chats`);
      setChatSessions(chatsResponse.data);

      if (response.data.aiMessage) {
        setMessages(prevMessages => [...prevMessages, response.data.aiMessage]);

        // Update chat title with first message
        if (
          chatSessions.find(chat => chat.id === currentChatId)?.title ===
          'New chat'
        ) {
          const truncatedMessage =
            messageContent.slice(0, 30) +
            (messageContent.length > 30 ? '...' : '');
          await handleUpdateChat(currentChatId, truncatedMessage);
        }

        toast.success('Message sent');
      } else {
        throw new Error('Incomplete response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setNewMessage(messageContent); // Restore message on error
      setError(error.message || 'Failed to send message. Please try again.');
      toast.error(error.message || 'Failed to send message');

      if (error.response?.data?.userMessage) {
        setMessages(prevMessages => [
          ...prevMessages,
          error.response.data.userMessage,
        ]);
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <Layout darkMode={true}>
      <div className='flex h-[calc(100vh-56px)] overflow-hidden'>
        <ChatHistory
          chats={chatSessions}
          onNewChat={async () => {
            setMessages([]);
            setNewMessage('');
            setError('');
            const cleanedSessions = chatSessions.filter(
              chat => chat.title !== 'New chat'
            );
            const chatId = Date.now().toString();
            router.push('/chat?id=' + chatId, undefined, { shallow: true });
            setActiveChatId(chatId);

            // Reset subject for new chat
            setSelectedSubject('');
            setChatSubjects(prev => ({
              ...prev,
              [chatId]: '',
            }));

            setChatSessions([
              { id: chatId, title: 'New chat' },
              ...cleanedSessions,
            ]);
          }}
          onDeleteChat={handleDeleteChat}
          onUpdateChat={handleUpdateChat}
        />
        <div className='flex-1 flex flex-col'>
          <div className='flex-1 overflow-y-auto p-4'>
            <div className='max-w-4xl mx-auto space-y-4'>
              {error && (
                <div className='bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-md text-center border border-red-700 text-sm'>
                  {error}
                </div>
              )}
              {userProfile && (
                <div className='bg-hf-blue bg-opacity-20 p-3 rounded-md'>
                  <p className='text-blue-300 text-sm'>
                    Welcome back, {userProfile.name}!
                    {selectedSubject &&
                      ` Currently discussing: ${selectedSubject}`}
                  </p>
                </div>
              )}

              {loading && !messages.length ? (
                <p className='text-text-medium text-center'>
                  Loading messages...
                </p>
              ) : (
                <>
                  {messages.length === 0 && !loading && (
                    <p className='text-text-medium text-center'>
                      No messages yet. Start the conversation!
                    </p>
                  )}
                  <ul className='space-y-4 mb-8'>
                    {messages
                      .filter(message => message && typeof message === 'object')
                      .map(message => (
                        <li
                          key={message._id}
                          className={`flex gap-3 ${message.isAiResponse ? 'justify-start' : 'justify-end'}`}
                        >
                          {message.isAiResponse && (
                            <div className='w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center overflow-hidden flex-shrink-0'>
                              <Image
                                src='/logo.png'
                                alt='BrainBytes AI'
                                width={32}
                                height={32}
                                className='w-full h-full object-cover'
                                fetchpriority='high'
                              />
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.isAiResponse
                                ? 'text-text-light'
                                : 'bg-hf-blue text-white max-w-xl'
                            }`}
                          >
                            <ChatMessageContent
                              text={message.text}
                              sentiment={message.sentiment}
                            />
                            <small
                              className={`block mt-1 text-xs ${message.isAiResponse ? 'text-text-medium' : 'text-blue-200'}`}
                            >
                              {message.createdAt
                                ? new Date(
                                    message.createdAt
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'No timestamp'}
                            </small>
                          </div>
                          {!message.isAiResponse && (
                            <div className='w-6 h-6 rounded-full bg-hf-yellow text-text-dark flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden'>
                              {userProfile?.profileImage ? (
                                <Image
                                  src={userProfile.profileImage}
                                  alt={userProfile.name}
                                  width={18}
                                  height={18}
                                  className='w-full h-full object-cover'
                                  fetchpriority='high'
                                />
                              ) : (
                                <span>
                                  {userProfile?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                  <div ref={messagesEndRef} />
                  {isTyping && (
                    <div className='flex items-center gap-3 mb-8'>
                      <div className='w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center overflow-hidden flex-shrink-0'>
                        <Image
                          src='/logo.png'
                          alt='BrainBytes AI'
                          width={32}
                          height={32}
                          className='w-full h-full object-cover'
                          fetchpriority='high'
                        />
                      </div>
                      <div className='p-3 rounded-lg'>
                        <div className='flex gap-2'>
                          <div
                            className='w-2 h-2 bg-text-medium rounded-full animate-bounce'
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className='w-2 h-2 bg-text-medium rounded-full animate-bounce'
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className='w-2 h-2 bg-text-medium rounded-full animate-bounce'
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className='sticky bottom-0 z-10'>
            <form
              onSubmit={handleSubmit}
              className='max-w-4xl mx-auto px-2 py-2'
            >
              {/* Main container for the input area, now flex-col */}
              <div className='flex flex-col gap-2 bg-bg-dark-secondary border border-border-dark rounded-xl p-2'>
                {/* Row for textarea */}
                <div className='relative flex items-end'>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder='Message BrainBytes...'
                    className='input bg-transparent border-none text-text-light flex-1 resize-none text-base py-2 px-2 focus:ring-0 focus:border-none placeholder-text-medium'
                    rows='1'
                    disabled={loading}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    style={{ minHeight: '40px' }} // Ensure textarea has some min height
                  />
                </div>
                {/* Row for Filter and Send Button */}
                <div className='flex items-center justify-between gap-2 pt-1'>
                  <select
                    value={selectedSubject}
                    onChange={async e => {
                      const newSubject = e.target.value;

                      // Create new chat with same title but different subject
                      const currentChat = chatSessions.find(
                        chat => chat.id === activeChatId
                      );
                      if (currentChat) {
                        const newChatId = Date.now().toString();
                        const newTitle = currentChat.title;

                        // First create new chat session
                        setChatSessions(prev => [
                          {
                            id: newChatId,
                            title: newTitle,
                            createdAt: new Date().toISOString(),
                          },
                          ...prev,
                        ]);

                        // Update router with new chat ID
                        router.push('/chat?id=' + newChatId, undefined, {
                          shallow: true,
                        });

                        // Set new active chat and subject
                        setActiveChatId(newChatId);
                        setSelectedSubject(newSubject);

                        // Store subject for new chat
                        setChatSubjects(prev => ({
                          ...prev,
                          [newChatId]: newSubject,
                        }));

                        // Clear messages for new conversation
                        setMessages([]);
                      }
                    }}
                    className='bg-bg-dark-secondary border border-border-dark text-text-light text-xs focus:ring-hf-blue focus:border-hf-blue h-8 pl-3 pr-6 py-1 rounded-full w-30'
                    title='Filter by subject'
                  >
                    <option value='' className='text-text-medium'>
                      All Subjects
                    </option>
                    {subjects.map(subject => (
                      <option
                        key={subject}
                        value={subject}
                        className='text-text-light bg-bg-dark'
                      >
                        {subject}
                      </option>
                    ))}
                  </select>
                  <button
                    type='submit'
                    disabled={loading || !newMessage.trim()}
                    className={`bg-hf-blue hover:bg-blue-700 text-white p-2 rounded-full transition-colors flex-shrink-0 ${
                      loading || !newMessage.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <line x1='22' y1='2' x2='11' y2='13'></line>
                      <polygon points='22 2 15 22 11 13 2 9 22 2'></polygon>
                    </svg>
                  </button>
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
