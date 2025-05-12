import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ChatHistory({ chats, onNewChat, activeChatId, onDeleteChat, onUpdateChat, onChatSelect }) {
  const [isOpen, setIsOpen] = useState(true); // For desktop collapse
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const editInputRef = useRef(null);

  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(chat);
    return groups;
  }, {});

  // Filter chats based on search query
  const filteredGroups = Object.entries(groupedChats).reduce((acc, [date, dateChats]) => {
    const filtered = dateChats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[date] = filtered;
    return acc;
  }, {});

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible && !e.target.closest('.context-menu')) {
        setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      chatId
    });
  };

  const handleEditTitle = (chatId, currentTitle) => {
    if (!chatId) return;
    setEditingId(chatId);
    setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
  };

  const handleUpdateTitle = (chatId, newTitle, e) => {
    if (!chatId || chatId === 'null') {
      setEditingId(null);
      return;
    }
    if (e.key === 'Enter' && newTitle.trim()) {
      onUpdateChat(chatId, newTitle.trim());
      setEditingId(null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className={`${isOpen ? 'w-72' : 'w-16'} bg-bg-dark-secondary h-full flex flex-col border-r border-border-dark transition-all duration-200`}>
      <div className="flex justify-between items-center p-2 border-b border-border-dark">
        {isOpen && (
          <button 
            onClick={onNewChat}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-bg-dark text-text-light w-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>New chat</span>
          </button>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-bg-dark text-text-light"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={isOpen ? "M15 10a1 1 0 01-1 1H6a1 1 0 110-2h8a1 1 0 011 1z" : "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"} clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <>
          <div className="p-2 border-b border-border-dark">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-dark text-text-light placeholder-text-medium py-2 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-hf-blue"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2.5 text-text-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-2">
            {Object.entries(filteredGroups).length > 0 ? (
              Object.entries(filteredGroups).map(([date, dateChats]) => (
                <div key={date} className="mb-4">
                  <div className="px-3 py-2 text-xs text-text-medium font-medium">
                    {date}
                  </div>
                  {dateChats.map(chat => (
                    <div key={chat.id} className="relative group">
                      {editingId === chat.id ? (
                        <input
                          ref={editInputRef}
                          defaultValue={chat.title}
                          onKeyDown={(e) => {
                            if (!chat.id) return;
                            handleUpdateTitle(chat.id, e.target.value, e);
                          }}
                          onBlur={() => setEditingId(null)}
                          className="w-full bg-bg-dark text-text-light p-3 text-sm focus:outline-none focus:ring-1 focus:ring-hf-blue"
                        />
                      ) : (
                        <div className="relative">
                          <Link 
                            href={`/chat?id=${chat.id}`}
                            onClick={() => {
                              if (onChatSelect) {
                                onChatSelect();
                              }
                            }}
                            className={`flex items-center p-3 text-sm hover:bg-bg-dark group ${activeChatId === chat.id ? 'bg-bg-dark' : ''}`}
                          >
                            <span className="flex-1 truncate">{chat.title || `Chat ${chat.id}`}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const button = e.currentTarget;
                                  const rect = button.getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const spaceRight = window.innerWidth - rect.left;
                                  
                                  // Position menu above button if not enough space below
                                  const y = spaceBelow < 100 ? rect.top - 4 : rect.bottom + 4;
                                  
                                  // Position menu to the left if not enough space to the right
                                  const x = spaceRight < 160 ? rect.right - 160 : rect.left;
                                  
                                  setContextMenu({
                                    visible: true,
                                    x,
                                    y,
                                    chatId: chat.id
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-bg-dark text-text-medium hover:text-text-light rounded transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-4 text-text-medium text-sm text-center">
                No chats yet
              </div>
            )}
          </div>

          {contextMenu.visible && (
            <div
              className="fixed bg-bg-dark-secondary border border-border-dark rounded-lg shadow-lg py-1 z-50 context-menu min-w-[160px] animate-fadeIn"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button
                onClick={() => handleEditTitle(contextMenu.chatId)}
                className="w-full px-4 py-2 text-sm text-left hover:bg-bg-dark flex items-center gap-2 text-text-light"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit title
              </button>
              <button
                onClick={() => {
                  onDeleteChat(contextMenu.chatId);
                  setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
                }}
                className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-900/30 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete chat
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
