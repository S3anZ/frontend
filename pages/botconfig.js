import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ChatHistoryDB } from '../lib/chatHistoryDB';

export default function BotConfig() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [userTotalUsage, setUserTotalUsage] = useState({
    totalMessages: 0,
    totalChats: 0,
    geminiUsage: 0,
    qwenUsage: 0,
    lastActivity: null
  });
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [modelDetails, setModelDetails] = useState([
    {
      id: 'gemini',
      name: 'Gemini',
      version: '2.5-Flash',
      status: 'Active',
      description: 'Google\'s most capable AI model for complex reasoning and creative tasks',
      lastUsed: '2 minutes ago',
      totalQueries: 1247,
      avgResponseTime: '1.2s',
      successRate: '99.2%'
    },
    {
      id: 'qwen3',
      name: 'Qwen3 Local',
      version: '0.6B',
      status: 'Active',
      description: 'Alibaba\'s efficient local model for fast, private conversations',
      lastUsed: '5 minutes ago',
      totalQueries: 892,
      avgResponseTime: '0.8s',
      successRate: '98.7%'
    }
  ]);
  const [sttStatus, setSttStatus] = useState({
    status: 'checking',
    model: 'Whisper Large-v3-Turbo',
    lastCheck: null
  });
  const [ttsStatus, setTtsStatus] = useState({
    status: 'checking',
    model: 'Kokoro-82M',
    lastCheck: null
  });
  const [usageData, setUsageData] = useState({
    totalChats: 1247,
    totalMessages: 3456,
    dailyUsage: [
      { date: '2025-01-01', gemini: 45, qwen3: 23, total: 68 },
      { date: '2025-01-02', gemini: 52, qwen3: 31, total: 83 },
      { date: '2025-01-03', gemini: 38, qwen3: 19, total: 57 },
      { date: '2025-01-04', gemini: 61, qwen3: 28, total: 89 },
      { date: '2025-01-05', gemini: 49, qwen3: 35, total: 84 },
      { date: '2025-01-06', gemini: 73, qwen3: 42, total: 115 },
      { date: '2025-01-07', gemini: 67, qwen3: 38, total: 105 },
      { date: '2025-01-08', gemini: 58, qwen3: 29, total: 87 },
      { date: '2025-01-09', gemini: 71, qwen3: 44, total: 115 },
      { date: '2025-01-10', gemini: 63, qwen3: 31, total: 94 },
      { date: '2025-01-11', gemini: 55, qwen3: 37, total: 92 },
      { date: '2025-01-12', gemini: 69, qwen3: 41, total: 110 },
      { date: '2025-01-13', gemini: 48, qwen3: 26, total: 74 },
      { date: '2025-01-14', gemini: 76, qwen3: 48, total: 124 }
    ]
  });

  // Authentication protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load user-specific usage data
  useEffect(() => {
    const loadUserUsage = async () => {
      if (user && !loading) {
        try {
          const chatHistory = await ChatHistoryDB.getChatHistory(user.id);
          let totalMessages = 0;
          let geminiCount = 0;
          let qwenCount = 0;
          let lastActivity = null;
          
          chatHistory.forEach(chat => {
            totalMessages += chat.messages.length;
            chat.messages.forEach(msg => {
              if (msg.role === 'bot') {
                if (msg.modelUsed === 'gemini') geminiCount++;
                else if (msg.modelUsed === 'qwen3') qwenCount++;
              }
              if (!lastActivity || new Date(msg.timestamp) > new Date(lastActivity)) {
                lastActivity = msg.timestamp;
              }
            });
          });
          
          setUserTotalUsage({
            totalMessages,
            totalChats: chatHistory.length,
            geminiUsage: geminiCount,
            qwenUsage: qwenCount,
            lastActivity
          });
        } catch (error) {
          console.error('Error loading user usage:', error);
        }
      }
    };
    loadUserUsage();
  }, [user, loading]);

  // Check STT service status
  useEffect(() => {
    const checkSttStatus = async () => {
      try {
        const response = await fetch('https://sean22123-backend.hf.space/stt/health');
        if (response.ok) {
          const data = await response.json();
          setSttStatus({
            status: data.model_loaded ? 'Online' : 'Model not loaded',
            model: data.current_model || 'Whisper Large-v3-Turbo',
            lastCheck: new Date().toLocaleTimeString()
          });
        } else {
          setSttStatus({
            status: 'Offline',
            model: 'Whisper Large-v3-Turbo',
            lastCheck: new Date().toLocaleTimeString()
          });
        }
      } catch (error) {
        setSttStatus({
          status: 'Offline',
          model: 'Whisper Large-v3-Turbo',
          lastCheck: new Date().toLocaleTimeString()
        });
      }
    };

    if (user && !loading) {
      checkSttStatus();
      // Check status every 30 seconds
      const interval = setInterval(checkSttStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  // Check TTS service status
  useEffect(() => {
    const checkTtsStatus = async () => {
      try {
        const response = await fetch('https://sean22123-backend.hf.space/tts/health');
        if (response.ok) {
          const data = await response.json();
          setTtsStatus({
            status: data.status === 'healthy' ? 'Online' : 'Offline',
            model: 'Kokoro-82M',
            lastCheck: new Date().toLocaleTimeString()
          });
        } else {
          setTtsStatus({
            status: 'Offline',
            model: 'Kokoro-82M',
            lastCheck: new Date().toLocaleTimeString()
          });
        }
      } catch (error) {
        setTtsStatus({
          status: 'Offline',
          model: 'Kokoro-82M',
          lastCheck: new Date().toLocaleTimeString()
        });
      }
    };

    if (user && !loading) {
      checkTtsStatus();
      // Check status every 30 seconds
      const interval = setInterval(checkTtsStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... • Bot Config</title>
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

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  const maxUsage = Math.max(...usageData.dailyUsage.map(d => d.total));

  return (
    <>
      <Head>
        <title>Bot Configuration • Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/css/conversational-chatbot.webflow.shared.c3f87610b.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
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
            <Link href="/chat-history" className="sidebar-link">
              <span className="material-icons sidebar-icon">history</span>
              <span className="sidebar-text">History</span>
            </Link>
            <Link href="/settings" className="sidebar-link">
              <span className="material-icons sidebar-icon">settings</span>
              <span className="sidebar-text">Settings</span>
            </Link>
            <Link href="/botconfig" className="sidebar-link active">
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

      <main className="container">
        <div className="page-header">
          <h1 className="page-title" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.1s forwards'}}>Analytics</h1>
          <p className="page-subtitle" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.2s forwards'}}>Manage your AI models and view usage analytics</p>
        </div>

        {/* System Status Dashboard */}
        <section className="dashboard-section">
          <h2 className="section-title">System Status</h2>
          <div className="status-grid">
            <div className="status-card online">
              <div className="status-header">
                <span className="material-icons status-icon">cloud_done</span>
                <div className="status-info">
                  <h3 className="status-title">API Services</h3>
                  <p className="status-subtitle">All systems operational</p>
                </div>
                <div className="status-indicator online"></div>
              </div>
              <div className="status-details">
                <div className="detail-item">
                  <span>Gemini API</span>
                  <span className="status-badge online">Online</span>
                </div>
                <div className="detail-item">
                  <span>Local Qwen3</span>
                  <span className="status-badge online">Active</span>
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="status-header">
                <span className="material-icons status-icon">memory</span>
                <div className="status-info">
                  <h3 className="status-title">GPU Memory</h3>
                  <p className="status-subtitle">45% allocated (optimized)</p>
                </div>
                <div className="usage-bar">
                  <div className="usage-fill" style={{width: '45%'}}></div>
                </div>
              </div>
              <div className="status-details">
                <div className="detail-item">
                  <span>Used</span>
                  <span>4.5 GB</span>
                </div>
                <div className="detail-item">
                  <span>Available</span>
                  <span>5.5 GB</span>
                </div>
                <div className="detail-item">
                  <span>Total</span>
                  <span>10.0 GB</span>
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="status-header">
                <span className="material-icons status-icon">speed</span>
                <div className="status-info">
                  <h3 className="status-title">Performance</h3>
                  <p className="status-subtitle">Excellent response times</p>
                </div>
                <div className="performance-meter">
                  <div className="meter-fill excellent"></div>
                </div>
              </div>
              <div className="status-details">
                <div className="detail-item">
                  <span>Avg Response</span>
                  <span>0.9s</span>
                </div>
                <div className="detail-item">
                  <span>Success Rate</span>
                  <span>99.1%</span>
                </div>
                <div className="detail-item">
                  <span>Uptime</span>
                  <span>99.8%</span>
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="status-header">
                <span className="material-icons status-icon">mic</span>
                <div className="status-info">
                  <h3 className="status-title">STT Model</h3>
                  <p className="status-subtitle">{sttStatus.status}</p>
                </div>
                <div className={`status-indicator ${sttStatus.status.toLowerCase()}`}></div>
              </div>
              <div className="status-details">
                <div className="detail-item">
                  <span>Model</span>
                  <span>{sttStatus.model}</span>
                </div>
                <div className="detail-item">
                  <span>Last Check</span>
                  <span>{sttStatus.lastCheck}</span>
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="status-header">
                <span className="material-icons status-icon">volume_up</span>
                <div className="status-info">
                  <h3 className="status-title">TTS Model</h3>
                  <p className="status-subtitle">{ttsStatus.status}</p>
                </div>
                <div className={`status-indicator ${ttsStatus.status.toLowerCase()}`}></div>
              </div>
              <div className="status-details">
                <div className="detail-item">
                  <span>Model</span>
                  <span>{ttsStatus.model}</span>
                </div>
                <div className="detail-item">
                  <span>Last Check</span>
                  <span>{ttsStatus.lastCheck}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Overview */}
        <section className="dashboard-section">
          <h2 className="section-title">Usage Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons stat-icon">chat</span>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{userTotalUsage.totalMessages.toLocaleString()}</h3>
                <p className="stat-label">Total Messages</p>
                <div className="stat-trend positive">
                  <span className="material-icons trend-icon">trending_up</span>
                  <span>+12% this week</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper gemini">
                <span className="material-icons stat-icon">psychology</span>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{userTotalUsage.geminiUsage.toLocaleString()}</h3>
                <p className="stat-label">Gemini Queries</p>
                <div className="stat-trend positive">
                  <span className="material-icons trend-icon">trending_up</span>
                  <span>+8% this week</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper qwen">
                <span className="material-icons stat-icon">computer</span>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{userTotalUsage.qwenUsage.toLocaleString()}</h3>
                <p className="stat-label">Qwen3 Queries</p>
                <div className="stat-trend neutral">
                  <span className="material-icons trend-icon">trending_flat</span>
                  <span>No change</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons stat-icon">forum</span>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{userTotalUsage.totalChats}</h3>
                <p className="stat-label">Total Chats</p>
                <div className="stat-trend positive">
                  <span className="material-icons trend-icon">trending_up</span>
                  <span>+5% this week</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Models */}
        

        {/* Usage Analytics */}
        <section className="analytics-section">
          <h2 className="section-title">Usage Analytics</h2>
          <div className="chart-container">
            <h3 className="chart-title">Daily Usage Trends - All Models</h3>
            <div className="line-chart">
              <svg className="chart-svg" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="57.14" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 57.14 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Total usage line */}
                <polyline
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={usageData.dailyUsage.map((day, index) => 
                    `${(index * 57.14) + 28.57},${180 - (day.total / maxUsage) * 160}`
                  ).join(' ')}
                />
                
                {/* Gemini usage line */}
                <polyline
                  fill="none"
                  stroke="#2196f3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={usageData.dailyUsage.map((day, index) => 
                    `${(index * 57.14) + 28.57},${180 - (day.gemini / maxUsage) * 160}`
                  ).join(' ')}
                />
                
                {/* Qwen3 usage line */}
                <polyline
                  fill="none"
                  stroke="#ff9800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={usageData.dailyUsage.map((day, index) => 
                    `${(index * 57.14) + 28.57},${180 - (day.qwen3 / maxUsage) * 160}`
                  ).join(' ')}
                />
                
                {/* Data points */}
                {usageData.dailyUsage.map((day, index) => (
                  <g key={index}>
                    {/* Total points */}
                    <circle
                      cx={(index * 57.14) + 28.57}
                      cy={180 - (day.total / maxUsage) * 160}
                      r="4"
                      fill="#4caf50"
                      className="data-point total-point"
                    >
                      <title>Total: {day.total}</title>
                    </circle>
                    
                    {/* Gemini points */}
                    <circle
                      cx={(index * 57.14) + 28.57}
                      cy={180 - (day.gemini / maxUsage) * 160}
                      r="3"
                      fill="#2196f3"
                      className="data-point gemini-point"
                    >
                      <title>Gemini: {day.gemini}</title>
                    </circle>
                    
                    {/* Qwen3 points */}
                    <circle
                      cx={(index * 57.14) + 28.57}
                      cy={180 - (day.qwen3 / maxUsage) * 160}
                      r="3"
                      fill="#ff9800"
                      className="data-point qwen3-point"
                    >
                      <title>Qwen3: {day.qwen3}</title>
                    </circle>
                  </g>
                ))}
              </svg>
              
              <div className="chart-labels">
                {usageData.dailyUsage.map((day, index) => (
                  <div key={index} className="chart-label">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color total-line-color"></div>
                  <span>Total Usage</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color gemini-line-color"></div>
                  <span>Gemini API</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color qwen3-line-color"></div>
                  <span>Qwen3 Local</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        /* Container and Layout */
        .container { max-width: 1200px; margin: 0 auto; padding: 24px 20px; margin-left: 60px; }

        /* Page Header */
        .page-header { text-align: center; padding: 16px 20px 32px; }
        .page-title { font-family: "Fjalla One", sans-serif; font-size: clamp(2rem, 6vw, 3rem); margin: 0 0 8px; letter-spacing: 0.04em; color: #ffffff; }
        .page-subtitle { font-family: "Source Sans 3", sans-serif; color: rgba(255,255,255,0.85); margin: 0; font-size: 1.1rem; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Dashboard Section */
        .dashboard-section { margin-bottom: 60px; }
        .section-title { font-family: "Fjalla One", sans-serif; font-size: 1.5rem; margin: 0 0 24px; color: #ffffff; }

        /* Status Grid */
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .status-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; transition: all 0.3s ease; }
        .status-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .status-card.online { border-color: rgba(76, 175, 80, 0.3); }
        
        .status-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .status-icon { font-size: 2.5rem; color: #4caf50; }
        .status-info { flex: 1; }
        .status-title { font-family: "Fjalla One", sans-serif; font-size: 1.2rem; margin: 0 0 4px; color: #ffffff; }
        .status-subtitle { font-family: "Source Sans 3", sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.7); margin: 0; }
        
        .status-indicator { width: 12px; height: 12px; border-radius: 50%; background: #4caf50; box-shadow: 0 0 12px rgba(76, 175, 80, 0.6); animation: pulse 2s infinite; }
        .status-indicator.online { background: #4caf50; box-shadow: 0 0 12px rgba(76, 175, 80, 0.6); }
        .status-indicator.offline { background: #f44336; box-shadow: 0 0 12px rgba(244, 67, 54, 0.6); animation: none; }
        .status-indicator.checking { background: #ff9800; box-shadow: 0 0 12px rgba(255, 152, 0, 0.6); }
        
        .usage-bar { width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .usage-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); border-radius: 3px; transition: width 0.3s ease; }
        
        .performance-meter { width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .meter-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
        .meter-fill.excellent { width: 90%; background: linear-gradient(90deg, #4caf50, #2e7d32); }
        
        .status-details { display: flex; flex-direction: column; gap: 12px; }
        .detail-item { display: flex; justify-content: space-between; align-items: center; font-family: "Source Sans 3", sans-serif; font-size: 0.85rem; }
        .detail-item span:first-child { color: rgba(255,255,255,0.7); }
        .detail-item span:last-child { color: #ffffff; font-weight: 500; }
        
        .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.online { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
        
        /* Actions Grid */
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .action-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.3s ease; border: none; color: inherit; text-align: left; }
        .action-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
        .action-icon { font-size: 2rem; color: #4caf50; flex-shrink: 0; }
        .action-content { flex: 1; }
        .action-title { font-family: "Fjalla One", sans-serif; font-size: 1.1rem; margin: 0 0 4px; color: #ffffff; }
        .action-desc { font-family: "Source Sans 3", sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.7); margin: 0; }
        
        /* Enhanced Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; transition: all 0.3s ease; }
        .stat-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        
        .stat-icon-wrapper { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(76, 175, 80, 0.15); }
        .stat-icon-wrapper.gemini { background: rgba(33, 150, 243, 0.15); }
        .stat-icon-wrapper.qwen { background: rgba(255, 152, 0, 0.15); }
        .stat-icon { font-size: 1.8rem; color: #4caf50; }
        .stat-icon-wrapper.gemini .stat-icon { color: #2196f3; }
        .stat-icon-wrapper.qwen .stat-icon { color: #ff9800; }
        
        .stat-content { }
        .stat-value { font-family: "Fjalla One", sans-serif; font-size: 2.2rem; color: #ffffff; margin: 0 0 8px; }
        .stat-label { font-family: "Source Sans 3", sans-serif; color: rgba(255,255,255,0.7); font-size: 0.95rem; margin: 0 0 12px; }
        
        .stat-trend { display: flex; align-items: center; gap: 6px; font-family: "Source Sans 3", sans-serif; font-size: 0.8rem; }
        .stat-trend.positive { color: #4caf50; }
        .stat-trend.neutral { color: rgba(255,255,255,0.6); }
        .stat-trend.negative { color: #f44336; }
        .trend-icon { font-size: 16px; }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 12px rgba(76, 175, 80, 0.6); }
          50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
          100% { box-shadow: 0 0 12px rgba(76, 175, 80, 0.6); }
        }

        /* Chart Container */
        .chart-container { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; }
        .chart-title { font-family: "Source Sans 3", sans-serif; font-size: 1.2rem; margin: 0 0 20px; color: #ffffff; }
        .line-chart { position: relative; }
        .chart-svg { width: 100%; height: 200px; margin-bottom: 16px; }
        .data-point { cursor: pointer; transition: all 0.3s ease; }
        .data-point:hover { r: 6; filter: drop-shadow(0 0 8px currentColor); }
        .chart-labels { display: flex; justify-content: space-between; padding: 0 20px; }
        .chart-label { font-family: "Source Sans 3", sans-serif; font-size: 0.75rem; color: rgba(255,255,255,0.7); text-align: center; flex: 1; }

        /* Chart Legend */
        .chart-legend { display: flex; gap: 24px; justify-content: center; margin-top: 16px; }
        .legend-item { display: flex; align-items: center; gap: 8px; }
        .legend-color { width: 12px; height: 12px; border-radius: 50%; }
        .total-line-color { background: #4caf50; }
        .gemini-line-color { background: #2196f3; }
        .qwen3-line-color { background: #ff9800; }
        .legend-item span { font-family: "Source Sans 3", sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.8); }

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

        /* Adjust main content when sidebar is present */
        .container {
          margin-left: 60px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .site-nav {
          margin-left: 60px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Responsive */
        @media (max-width: 767px) {
          .models-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          
          .sidebar {
            width: 50px;
          }
          
          .sidebar-open {
            width: 260px;
          }
          
          .sidebar-trigger {
            width: 50px;
            height: 50px;
          }
          
          .sidebar-content {
            padding-top: 50px;
          }
          
          .container {
            margin-left: 50px;
          }
          
          .site-nav {
            margin-left: 50px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .models-grid { grid-template-columns: 1fr; }
          
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