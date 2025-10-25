import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/api';

export default function Settings() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [defaultModel, setDefaultModel] = useState('gemini');
  const [selectedLanguage, setSelectedLanguage] = useState('american_english');
  const [selectedVoice, setSelectedVoice] = useState('af_heart');
  const [voices, setVoices] = useState({});
  const [testingVoice, setTestingVoice] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState('default');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('default');

  const testText = "Hello! I am here to assist you today!";

  const languageOptions = {
    'american_english': 'American English 🇺🇸',
    'british_english': 'British English 🇬🇧',
    'japanese': 'Japanese 🇯🇵',
    'mandarin_chinese': 'Mandarin Chinese 🇨🇳',
    'spanish': 'Spanish 🇪🇸',
    'french': 'French 🇫🇷',
    'hindi': 'Hindi 🇮🇳',
    'italian': 'Italian 🇮🇹',
    'brazilian_portuguese': 'Brazilian Portuguese 🇧🇷'
  };

  // Authentication protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load settings and voices
  useEffect(() => {
    if (user) {
      loadSettings();
      loadVoices();
      loadAudioDevices();
    }
  }, [user]);

  const loadSettings = () => {
    const savedModel = localStorage.getItem(`defaultModel_${user.id}`);
    const savedLanguage = localStorage.getItem(`defaultLanguage_${user.id}`);
    const savedVoice = localStorage.getItem(`defaultVoice_${user.id}`);
    const savedInputDevice = localStorage.getItem(`audioInputDevice_${user.id}`);
    const savedOutputDevice = localStorage.getItem(`audioOutputDevice_${user.id}`);
    
    if (savedModel) setDefaultModel(savedModel);
    if (savedLanguage) setSelectedLanguage(savedLanguage);
    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedInputDevice) setSelectedInputDevice(savedInputDevice);
    if (savedOutputDevice) setSelectedOutputDevice(savedOutputDevice);
  };

  const loadVoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tts/voices`);
      if (response.ok) {
        const voiceData = await response.json();
        setVoices(voiceData);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadAudioDevices = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputDevices = [
        { deviceId: 'default', label: 'Default - System Default' },
        ...devices.filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`
          }))
      ];
      
      const outputDevices = [
        { deviceId: 'default', label: 'Default - System Default' },
        ...devices.filter(device => device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`
          }))
      ];
      
      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);
    } catch (error) {
      console.error('Failed to load audio devices:', error);
      // Set default options if permission denied
      setAudioInputDevices([{ deviceId: 'default', label: 'Default - System Default' }]);
      setAudioOutputDevices([{ deviceId: 'default', label: 'Default - System Default' }]);
    }
  };

  const saveSettings = () => {
    localStorage.setItem(`defaultModel_${user.id}`, defaultModel);
    localStorage.setItem(`defaultLanguage_${user.id}`, selectedLanguage);
    localStorage.setItem(`defaultVoice_${user.id}`, selectedVoice);
    localStorage.setItem(`audioInputDevice_${user.id}`, selectedInputDevice);
    localStorage.setItem(`audioOutputDevice_${user.id}`, selectedOutputDevice);
    
    setSaveMessage('Changes are saved');
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setSaveMessage('');
    }, 5000);
  };

  const testVoice = async () => {
    if (testingVoice) return;
    
    setTestingVoice(true);
    
    try {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
      }

      const response = await fetch(`${API_BASE_URL}/tts/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voice: selectedVoice
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setPlayingAudio(audio);
      
      await audio.play();
      
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        setPlayingAudio(null);
        setTestingVoice(false);
      });
      
    } catch (error) {
      console.error('Voice test error:', error);
      alert('Voice test failed. Please make sure the TTS server is running.');
      setTestingVoice(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getAvailableVoices = () => {
    if (!voices[selectedLanguage]) return [];
    
    const languageVoices = voices[selectedLanguage];
    const allVoices = [];
    
    if (languageVoices.female) {
      allVoices.push(...languageVoices.female.map(v => ({...v, gender: 'Female'})));
    }
    if (languageVoices.male) {
      allVoices.push(...languageVoices.male.map(v => ({...v, gender: 'Male'})));
    }
    
    return allVoices;
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... • Settings</title>
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Settings • Chat</title>
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
            <Link href="/settings" className="sidebar-link active">
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
        <div className="settings-header">
          <h1 className="title" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.1s forwards'}}>Settings</h1>
          <p className="subtitle" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.2s forwards'}}>Customize your AI experience</p>
        </div>

        <div className="settings-content">
          {/* AI Model Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              Default AI Model
            </h2>
            <p className="section-description">Choose your preferred AI model for new chats</p>
            
            <div className="model-options">
              <label className={`model-option ${defaultModel === 'gemini' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="defaultModel"
                  value="gemini"
                  checked={defaultModel === 'gemini'}
                  onChange={(e) => setDefaultModel(e.target.value)}
                />
                <div className="model-info">
                  <span className="model-name">Gemini 1.5 Flash</span>
                  <span className="model-desc">Google's fast and efficient AI model</span>
                </div>
                <span className="checkmark">✓</span>
              </label>
              
              <label className={`model-option ${defaultModel === 'qwen3' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="defaultModel"
                  value="qwen3"
                  checked={defaultModel === 'qwen3'}
                  onChange={(e) => setDefaultModel(e.target.value)}
                />
                <div className="model-info">
                  <span className="model-name">Qwen3 Local</span>
                  <span className="model-desc">Local processing with privacy</span>
                </div>
                <span className="checkmark">✓</span>
              </label>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              Text-to-Speech Voice
            </h2>
            <p className="section-description">Select your preferred voice and language</p>
            
            <div className="voice-settings">
              <div className="setting-group">
                <label className="setting-label">Language</label>
                <select 
                  className="setting-select"
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    // Reset voice to first available when language changes
                    const newVoices = getAvailableVoices();
                    if (newVoices.length > 0) {
                      setSelectedVoice(newVoices[0].id);
                    }
                  }}
                >
                  {Object.entries(languageOptions).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Voice</label>
                <select 
                  className="setting-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {getAvailableVoices().map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} ({voice.gender}) - Quality: {voice.quality || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="voice-test">
                <button 
                  className={`test-voice-btn ${testingVoice ? 'testing' : ''}`}
                  onClick={testVoice}
                  disabled={testingVoice}
                >
                  <span className="material-icons">
                    {testingVoice ? 'stop' : 'play_arrow'}
                  </span>
                  {testingVoice ? 'Playing...' : 'Test Voice'}
                </button>
                <span className="test-text">"{testText}"</span>
              </div>
            </div>
          </div>

          {/* Audio Device Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              Audio Devices
            </h2>
            <p className="section-description">Select your preferred audio input and output devices</p>
            
            <div className="audio-device-settings">
              <div className="setting-group">
                <label className="setting-label">Input Device</label>
                <select 
                  className="setting-select"
                  value={selectedInputDevice}
                  onChange={(e) => setSelectedInputDevice(e.target.value)}
                >
                  {audioInputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Output Device</label>
                <select 
                  className="setting-select"
                  value={selectedOutputDevice}
                  onChange={(e) => setSelectedOutputDevice(e.target.value)}
                >
                  {audioOutputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-actions">
            {saveMessage && (
              <div className="save-message">
                <span className="material-icons">check_circle</span>
                {saveMessage}
              </div>
            )}
            <button className="save-btn" onClick={saveSettings}>
              <span className="material-icons">save</span>
              Save Settings
            </button>
          </div>
        </div>
      </main>

      <style jsx global>{`
        /* Base styles inherited from startmenu */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000000; color: #ffffff; height: 100%; }
        .container { max-width: 1200px; margin: 0 auto; padding: 24px 20px; margin-left: 60px; }

        /* Settings specific styles */
        .settings-header {
          text-align: center;
          padding: 20px 0 40px;
        }

        .title {
          font-family: "Fjalla One", sans-serif;
          font-size: clamp(2rem, 6vw, 3rem);
          margin: 0 0 8px;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        .subtitle {
          font-family: "Source Sans 3", sans-serif;
          color: rgba(255,255,255,0.85);
          margin: 0;
          font-size: 1.1rem;
        }

        .settings-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: "Fjalla One", sans-serif;
          font-size: 1.5rem;
          margin: 0 0 8px;
          color: #ffffff;
        }

        .section-icon {
          font-size: 24px;
          color: #4caf50;
        }

        .section-description {
          font-family: "Source Sans 3", sans-serif;
          color: rgba(255,255,255,0.7);
          margin: 0 0 20px;
          font-size: 0.95rem;
        }

        /* Model Options */
        .model-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .model-option {
          display: flex;
          align-items: center;
          padding: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .model-option:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }

        .model-option.selected {
          background: rgba(76, 175, 80, 0.15);
          border-color: rgba(76, 175, 80, 0.4);
        }

        .model-option input[type="radio"] {
          display: none;
        }

        .model-info {
          flex: 1;
          margin-left: 12px;
        }

        .model-name {
          display: block;
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          font-size: 1rem;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .model-desc {
          display: block;
          font-family: "Source Sans 3", sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.6);
        }

        .checkmark {
          color: #4caf50;
          font-weight: bold;
          font-size: 18px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .model-option.selected .checkmark {
          opacity: 1;
        }

        /* Voice Settings */
        .voice-settings {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-label {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          color: #ffffff;
          font-size: 0.95rem;
        }

        .setting-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-family: "Source Sans 3", sans-serif;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .setting-select:focus {
          outline: none;
          border-color: #4caf50;
          background: rgba(255,255,255,0.08);
        }

        .setting-select option {
          background: #1a1a1a;
          color: #ffffff;
        }

        /* Voice Test */
        .voice-test {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .test-voice-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #4caf50;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 10px 16px;
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .test-voice-btn:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-1px);
        }

        .test-voice-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .test-voice-btn.testing {
          background: #ff5722;
        }

        .test-voice-btn.testing:hover {
          background: #e64a19;
        }

        .test-text {
          font-family: "Source Sans 3", sans-serif;
          color: rgba(255,255,255,0.7);
          font-style: italic;
          font-size: 0.9rem;
        }

        /* Audio Device Settings */
        .audio-device-settings {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Save Actions */
        .settings-actions {
          text-align: center;
          padding: 20px 0;
        }

        .save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #4caf50;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        /* Save Message */
        .save-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-family: "Source Sans 3", sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          animation: fadeInOut 5s ease-in-out;
        }

        .save-message .material-icons {
          font-size: 18px;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Sidebar styles (inherited from startmenu) */
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

        /* Navigation styles */
        .site-nav {
          position: sticky;
          top: 0;
          z-index: 40;
          background: inherit;
          padding: 12px 20px;
          margin-left: 60px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .site-nav_inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }

        .site-nav_brand {
          font-family: "Fjalla One", sans-serif;
          font-size: 1.125rem;
          letter-spacing: 0.02em;
          color: #7a7a7a;
          text-decoration: none;
        }

        .site-nav_links {
          display: flex;
          gap: 16px;
        }

        .site-nav_link {
          font-family: "Source Sans 3", sans-serif;
          color: #7a7a7a;
          text-decoration: none;
          font-size: 0.975rem;
        }

        .site-nav_link:hover, .site-nav_brand:hover {
          color: #5f5f5f;
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
