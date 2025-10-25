import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ChatHistoryDB } from '../lib/chatHistoryDB';

export default function ChatHistory() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      if (user && !loading) {
        try {
          setIsLoading(true);
          const history = await ChatHistoryDB.getChatHistory(user.id);
          setChatHistory(history);
        } catch (error) {
          console.error('Error loading chat history:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadHistory();
  }, [user, loading]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleChatSelect = (chat) => {
    if (!chat.isClosed) {
      ChatHistoryDB.setCurrentChat(user.id, chat.id);
      router.push('/startmenu');
    }
  };

  const handleCloseChat = async (chatId, e) => {
    e.stopPropagation();
    await ChatHistoryDB.closeChat(user.id, chatId);
    const updatedHistory = await ChatHistoryDB.getChatHistory(user.id);
    setChatHistory(updatedHistory);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setShowDeleteConfirm(chatId);
  };

  const confirmDelete = async (chatId) => {
    await ChatHistoryDB.deleteChat(user.id, chatId);
    const updatedHistory = await ChatHistoryDB.getChatHistory(user.id);
    setChatHistory(updatedHistory);
    setShowDeleteConfirm(null);
  };

  const handleNewChat = async () => {
    await ChatHistoryDB.createNewChat(user.id);
    router.push('/startmenu');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... • Chat History</title>
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#000000',
          color: '#ffffff'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #3a3a3a',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Chat History • Qwen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/css/conversational-chatbot.webflow.shared.c3f87610b.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="/images/app-icon.png" rel="apple-touch-icon" />
      </Head>

      {/* Sidebar */}
      <div 
        className={`sidebar ${sidebarHovered ? 'sidebar-open' : ''}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="sidebar-trigger">
          <span className="material-icons hamburger-icon">menu</span>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>
          <nav className="sidebar-nav">
            <Link href="/home" className="sidebar-link">
              <span className="material-icons sidebar-icon">home</span>
              <span className="sidebar-text">Home</span>
            </Link>
            <Link href="/profile" className="sidebar-link">
              <span className="material-icons sidebar-icon">person</span>
              <span className="sidebar-text">Profile</span>
            </Link>
            <Link href="/startmenu" className="sidebar-link">
              <span className="material-icons sidebar-icon">chat</span>
              <span className="sidebar-text">Chat</span>
            </Link>
            <Link href="/chat-history" className="sidebar-link active">
              <span className="material-icons sidebar-icon">history</span>
              <span className="sidebar-text">History</span>
            </Link>
            <Link href="/settings" className="sidebar-link">
              <span className="material-icons sidebar-icon">settings</span>
              <span className="sidebar-text">Settings</span>
            </Link>
            <Link href="/botconfig" className="sidebar-link">
              <span className="material-icons sidebar-icon">analytics</span>
              <span className="sidebar-text">Analytics</span>
            </Link>
            <button onClick={handleSignOut} className="sidebar-link sidebar-logout">
              <span className="material-icons sidebar-icon">logout</span>
              <span className="sidebar-text">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>

      <header className="site-nav" role="navigation" aria-label="Primary">
        <div className="site-nav_inner">
          <Link href="/" className="site-nav_brand">Qwen</Link>
          <nav className="site-nav_links">
            <Link href="/" className="site-nav_link">Meet Qwen</Link>
            <Link href="/home" className="site-nav_link">Home</Link>
            <Link href="/about" className="site-nav_link">Working</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <div className="header">
          <h1 className="title" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.1s forwards', color: '#ffffff'}}>Chat History</h1>
          <p className="subtitle" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.2s forwards'}}>Your previous conversations with Qwen</p>
        </div>

        <div className="history-actions">
          <button onClick={handleNewChat} className="new-chat-btn">
            <span className="material-icons">add</span>
            Start New Chat
          </button>
        </div>

        <div className="history-container">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading chat history...</p>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons empty-icon">chat_bubble_outline</span>
              <h3>No chat history yet</h3>
              <p>Start your first conversation with Qwen!</p>
              <button onClick={handleNewChat} className="start-first-chat-btn">
                Start Chatting
              </button>
            </div>
          ) : (
            <div className="history-list">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${chat.isClosed ? 'closed' : ''} ${selectedChat === chat.id ? 'selected' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-item-header">
                    <div className="chat-title">
                      <span className="material-icons chat-icon">
                        {chat.isClosed ? 'lock' : 'chat_bubble'}
                      </span>
                      <h3>{chat.title}</h3>
                    </div>
                    <div className="chat-actions">
                      {!chat.isClosed && (
                        <button
                          onClick={(e) => handleCloseChat(chat.id, e)}
                          className="action-btn close-btn"
                          title="Close Chat"
                        >
                          <span className="material-icons">lock</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="action-btn delete-btn"
                        title="Delete Chat"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="chat-meta">
                    <span className="chat-date">{formatDate(chat.updatedAt)}</span>
                    <span className="chat-time">{formatTime(chat.updatedAt)}</span>
                    <span className="message-count">{chat.messages.length} messages</span>
                    {chat.hasImage && (
                      <span className="image-indicator">
                        <span className="material-icons">attach_file_add</span>
                        {chat.images && chat.images.length > 1 
                          ? `${chat.images.length} Images Attached`
                          : 'Image Attached'
                        }
                      </span>
                    )}
                  </div>
                  
                  {chat.messages.length > 0 && (
                    <div className="chat-preview">
                      {chat.messages[chat.messages.length - 1].text.substring(0, 100)}
                      {chat.messages[chat.messages.length - 1].text.length > 100 && '...'}
                    </div>
                  )}
                  
                  {chat.isClosed && (
                    <div className="closed-badge">
                      <span className="material-icons">lock</span>
                      Closed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Chat</h3>
            <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(null)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={() => confirmDelete(showDeleteConfirm)} className="delete-confirm-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Base and theme */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000000; color: #ffffff; height: 100%; }
        img, video, canvas { max-width: 100%; height: auto; }
        .container { max-width: 1200px; margin: 0 auto; padding: 24px 20px; margin-left: 60px; }

        /* Top Navigation */
        .site-nav { position: sticky; top: 0; z-index: 40; background: inherit; padding: 12px 20px; margin-left: 60px; }
        .site-nav_inner { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
        .site-nav_brand { font-family: "Fjalla One", sans-serif; font-size: 1.125rem; letter-spacing: 0.02em; color: #7a7a7a; text-decoration: none; }
        .site-nav_links { display: flex; gap: 16px; }
        .site-nav_link { font-family: "Source Sans 3", sans-serif; color: #7a7a7a; text-decoration: none; font-size: 0.975rem; }
        .site-nav_link:hover, .site-nav_brand:hover { color: #5f5f5f; }

        /* Header */
        .header { text-align: center; padding: 16px 20px 32px; }
        .title { font-family: "Fjalla One", sans-serif; font-size: clamp(2rem, 6vw, 3rem); margin: 0 0 8px; letter-spacing: 0.04em; }
        .subtitle { font-family: "Source Sans 3", sans-serif; color: rgba(255,255,255,0.85); margin: 0; }

        /* History Actions */
        .history-actions { display: flex; justify-content: center; margin-bottom: 32px; }
        .new-chat-btn { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          background: #1a1a1a; 
          color: #ffffff; 
          border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 8px; 
          padding: 12px 24px; 
          font-family: "Source Sans 3", sans-serif; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s ease; 
        }
        .new-chat-btn:hover { background: #222; transform: translateY(-1px); }

        /* History Container */
        .history-container { max-width: 800px; margin: 0 auto; }

        /* Empty State */
        .empty-state { 
          text-align: center; 
          padding: 60px 20px; 
          color: rgba(255,255,255,0.7); 
        }
        .empty-icon { 
          font-size: 4rem; 
          margin-bottom: 16px; 
          opacity: 0.5; 
        }
        .empty-state h3 { 
          font-family: "Fjalla One", sans-serif; 
          font-size: 1.5rem; 
          margin: 0 0 8px; 
          color: #ffffff; 
        }
        .empty-state p { 
          font-family: "Source Sans 3", sans-serif; 
          margin: 0 0 24px; 
        }
        .start-first-chat-btn { 
          background: #1a1a1a; 
          color: #ffffff; 
          border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 8px; 
          padding: 12px 24px; 
          font-family: "Source Sans 3", sans-serif; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s ease; 
        }
        .start-first-chat-btn:hover { background: #222; transform: translateY(-1px); }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.7);
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top: 3px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* History List */
        .history-list { display: flex; flex-direction: column; gap: 12px; }

        /* Chat Item */
        .chat-item { 
          background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.08); 
          border-radius: 12px; 
          padding: 20px; 
          cursor: pointer; 
          transition: all 0.2s ease; 
          position: relative; 
        }
        .chat-item:hover { 
          background: rgba(255,255,255,0.06); 
          border-color: rgba(255,255,255,0.15); 
          transform: translateY(-1px); 
        }
        .chat-item.closed { 
          opacity: 0.7; 
          cursor: not-allowed; 
        }
        .chat-item.closed:hover { 
          transform: none; 
          background: rgba(255,255,255,0.03); 
        }
        .chat-item.selected { 
          border-color: rgba(255,255,255,0.3); 
          background: rgba(255,255,255,0.08); 
        }

        /* Chat Item Header */
        .chat-item-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 12px; 
        }
        .chat-title { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          flex: 1; 
        }
        .chat-icon { 
          color: rgba(255,255,255,0.6); 
          font-size: 20px; 
        }
        .chat-title h3 { 
          font-family: "Source Sans 3", sans-serif; 
          font-size: 1.1rem; 
          font-weight: 600; 
          margin: 0; 
          color: #ffffff; 
          line-height: 1.3; 
        }

        /* Chat Actions */
        .chat-actions { 
          display: flex; 
          gap: 8px; 
          opacity: 0; 
          transition: opacity 0.2s ease; 
        }
        .chat-item:hover .chat-actions { opacity: 1; }
        .action-btn { 
          background: none; 
          border: none; 
          color: rgba(255,255,255,0.6); 
          cursor: pointer; 
          padding: 4px; 
          border-radius: 4px; 
          transition: all 0.2s ease; 
        }
        .action-btn:hover { 
          background: rgba(255,255,255,0.1); 
          color: #ffffff; 
        }
        .close-btn:hover { color: #ffc107; }
        .delete-btn:hover { color: #ff4444; }

        /* Chat Meta */
        .chat-meta { 
          display: flex; 
          gap: 16px; 
          font-family: "Source Sans 3", sans-serif; 
          font-size: 0.85rem; 
          color: rgba(255,255,255,0.6); 
          margin-bottom: 8px; 
        }

        /* Image Indicator */
        .image-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #4caf50;
          font-weight: 600;
        }
        .image-indicator .material-icons {
          font-size: 16px;
        }

        /* Chat Preview */
        .chat-preview { 
          font-family: "Source Sans 3", sans-serif; 
          font-size: 0.9rem; 
          color: rgba(255,255,255,0.7); 
          line-height: 1.4; 
        }

        /* Closed Badge */
        .closed-badge { 
          display: flex; 
          align-items: center; 
          gap: 4px; 
          background: rgba(255,193,7,0.2); 
          color: #ffc107; 
          padding: 4px 8px; 
          border-radius: 12px; 
          font-size: 0.75rem; 
          font-weight: 600; 
          margin-top: 8px;
          width: fit-content;
        }

        /* Modal */
        .modal-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background: rgba(0,0,0,0.8); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1000; 
        }
        .modal { 
          background: #1a1a1a; 
          border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 12px; 
          padding: 24px; 
          max-width: 400px; 
          width: 90%; 
        }
        .modal h3 { 
          font-family: "Fjalla One", sans-serif; 
          margin: 0 0 12px; 
          color: #ffffff; 
        }
        .modal p { 
          font-family: "Source Sans 3", sans-serif; 
          color: rgba(255,255,255,0.8); 
          margin: 0 0 24px; 
        }
        .modal-actions { 
          display: flex; 
          gap: 12px; 
          justify-content: flex-end; 
        }
        .cancel-btn, .delete-confirm-btn { 
          padding: 8px 16px; 
          border-radius: 6px; 
          font-family: "Source Sans 3", sans-serif; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s ease; 
        }
        .cancel-btn { 
          background: none; 
          border: 1px solid rgba(255,255,255,0.3); 
          color: #ffffff; 
        }
        .cancel-btn:hover { background: rgba(255,255,255,0.1); }
        .delete-confirm-btn { 
          background: #ff4444; 
          border: 1px solid #ff4444; 
          color: #ffffff; 
        }
        .delete-confirm-btn:hover { background: #ff6666; }

        /* Sidebar Styles */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 60px;
          background: rgba(0, 0, 0, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          overflow: hidden;
        }

        .sidebar-open {
          width: 280px;
        }

        .sidebar-trigger {
          position: absolute;
          top: 0;
          left: 0;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .hamburger-icon {
          color: #7a7a7a;
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .sidebar-open .hamburger-icon {
          transform: rotate(180deg);
        }

        .sidebar-content {
          padding-top: 60px;
          height: 100%;
          opacity: 1;
          transform: translateX(0);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          padding: 0;
          border-bottom: none;
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 0;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 60px;
          right: 0;
          display: flex;
          align-items: center;
          padding-left: 12px;
          gap: 12px;
        }

        .sidebar-open .sidebar-header {
          opacity: 1;
          height: 60px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sidebar-header h3 {
          font-family: "Fjalla One", sans-serif;
          font-size: 1.125rem;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .sidebar-nav {
          padding: 0;
          margin-top: 0;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          height: calc(100% - 60px);
        }

        .sidebar:not(.sidebar-open) .sidebar-nav {
          padding: 0;
          padding-top: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          height: calc(100% - 60px);
        }

        .sidebar-open .sidebar-nav {
          padding: 0;
          display: flex;
          flex-direction: column;
          height: calc(100% - 60px);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 16px 0;
          color: #7a7a7a;
          text-decoration: none;
          border: none;
          background: none;
          font-family: "Source Sans 3", sans-serif;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          position: relative;
          border-radius: 0 25px 25px 0;
          margin: 2px 0;
        }

        .sidebar-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }

        .sidebar-link.active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        .sidebar-link:active {
          background: rgba(255, 255, 255, 0.12);
        }

        .sidebar-icon {
          width: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          line-height: 1;
        }

        .sidebar:not(.sidebar-open) .sidebar-icon {
          width: 100%;
          text-align: center;
        }

        .sidebar-link:hover .sidebar-icon {
          transform: scale(1.1);
        }

        .sidebar-text {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          padding-left: 8px;
          font-weight: 500;
        }

        .sidebar-open .sidebar-text {
          opacity: 1;
          transform: translateX(0);
        }

        .sidebar-logout {
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
          margin-bottom: 16px;
        }

        /* Responsive */
        @media (max-width: 767px) {
          .sidebar {
            width: 50px;
          }
          
          .sidebar-open {
            width: 260px;
          }
          
          .container {
            margin-left: 50px;
          }
          
          .site-nav {
            margin-left: 50px;
          }
          
          .site-nav_links {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 45px;
          }
          
          .sidebar-open {
            width: 100vw;
          }
          
          .container {
            margin-left: 45px;
          }
          
          .site-nav {
            margin-left: 45px;
          }
        }
      `}</style>
    </>
  );
}
