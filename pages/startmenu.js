import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ChatHistoryDB } from '../lib/chatHistoryDB';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';

export default function StartMenu() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [titleVisible, setTitleVisible] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [bulbToggled, setBulbToggled] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [defaultVoice, setDefaultVoice] = useState('af_heart');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Authentication protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load user settings
  useEffect(() => {
    if (user) {
      const savedModel = localStorage.getItem(`defaultModel_${user.id}`);
      const savedVoice = localStorage.getItem(`defaultVoice_${user.id}`);
      
      if (savedModel) setSelectedModel(savedModel);
      if (savedVoice) setDefaultVoice(savedVoice);
    }
  }, [user]);

  // Load or create chat session
  useEffect(() => {
    const loadChatSession = async () => {
      if (user && !loading) {
        const existingChatId = ChatHistoryDB.getCurrentChatId(user.id);
        
        if (existingChatId) {
          const existingChat = await ChatHistoryDB.getChat(user.id, existingChatId);
          if (existingChat && !existingChat.isClosed) {
            setCurrentChatId(existingChatId);
            setCurrentChat(existingChat);
            setMessages(existingChat.messages);
            if (existingChat.messages.length > 0) {
              setTitleVisible(false);
            }
            // Set uploaded image state if chat has image
            if (existingChat.hasImage) {
              // Set multiple images if available
              if (existingChat.images && existingChat.images.length > 0) {
                setUploadedImages(existingChat.images);
              } else {
                // Fallback to single image for backward compatibility
                setUploadedImages([{
                  url: existingChat.imageUrl,
                  name: existingChat.imageName
                }]);
              }
            } else {
              setUploadedImages([]);
            }
          } else {
            // Create new chat if existing one is closed or doesn't exist
            const newChat = await ChatHistoryDB.createNewChat(user.id);
            setCurrentChatId(newChat.id);
            setCurrentChat(newChat);
            setMessages([]);
            setUploadedImages([]);
          }
        } else {
          // Create new chat
          const newChat = await ChatHistoryDB.createNewChat(user.id);
          setCurrentChatId(newChat.id);
          setCurrentChat(newChat);
          setMessages([]);
          setUploadedImages([]);
        }
      }
    };

    loadChatSession();
  }, [user, loading]);

  // Reset model selector when dropdown closes
  useEffect(() => {
    if (!dropdownVisible) {
      setShowModelSelector(false);
    }
  }, [dropdownVisible]);

  const handleInputFocus = () => {
    setTitleVisible(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleMicToggle = () => {
    setMicActive(!micActive);
    if (micActive) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleListen = async (messageText, messageId) => {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
      }

      // Call TTS API
      const response = await fetch(`${API_BASE_URL}/tts/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText,
          voice: defaultVoice // Use saved voice preference
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.status}`);
      }

      // Get audio blob and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setPlayingAudio(audio);
      
      // Play the audio
      await audio.play();
      
      // Clean up when audio ends
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        setPlayingAudio(null);
      });
      
    } catch (error) {
      console.error('TTS error:', error);
      // You could add a toast notification here
      alert('Sorry, text-to-speech is not available right now. Please make sure the TTS server is running on port 5001.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    if (!currentChatId || !user) return;
    
    setTitleVisible(false);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text,
      role: 'user',
      timestamp: formatTime(new Date()),
      hasImage: uploadedImages.length > 0
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Save user message to chat history
    const result = await ChatHistoryDB.addMessageToChat(user.id, currentChatId, userMessage, currentChat);
    
    // Update chat ID if it was changed (temporary to permanent)
    if (result && result.chatId && result.chatId !== currentChatId) {
      setCurrentChatId(result.chatId);
      setCurrentChat(prev => ({ ...prev, id: result.chatId, isTemporary: false }));
    }
    
    // Add typing indicator
    const typingMessage = {
      id: 'typing',
      text: uploadedImages.length > 0 ? 'Analyzing image...' : 'Thinking...',
      role: 'bot',
      timestamp: formatTime(new Date()),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);
    
    try {
      let finalMessage = text;
      
      // If images are uploaded, classify them first
      if (uploadedImages.length > 0) {
        try {
          const imageClassifications = [];
          
          for (const image of uploadedImages) {
            // Convert image URL to base64
            const response = await fetch(image.url);
            const blob = await response.blob();
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            
            // Classify image
            const classifyResponse = await fetch(`${API_BASE_URL}/classify-image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64,
                model: selectedModel
              })
            });
            
            if (classifyResponse.ok) {
              const classifyData = await classifyResponse.json();
              imageClassifications.push(classifyData);
            }
          }
          
          // Build context from image classifications
          if (imageClassifications.length > 0) {
            let imageContext = '\n\n[Image Analysis]:\n';
            imageClassifications.forEach((classification, index) => {
              if (selectedModel === 'qwen3' || selectedModel === 'qwen') {
                // ViT returns structured classifications
                const topPredictions = classification.classifications.slice(0, 3);
                imageContext += `Image ${index + 1}: ${topPredictions.map(c => `${c.label} (${(c.score * 100).toFixed(1)}%)`).join(', ')}\n`;
              } else {
                // Gemini returns description
                imageContext += `Image ${index + 1}: ${classification.description}\n`;
              }
            });
            
            finalMessage = text + imageContext;
          }
        } catch (imageError) {
          console.error('Image classification error:', imageError);
          // Continue with original message if image classification fails
        }
      }
      
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));
      
      // Call Python API with potentially enhanced message
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalMessage,
          conversation_history: conversationHistory,
          model: selectedModel
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Remove typing indicator and add bot response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'typing');
        const botMessage = {
          id: Date.now() + 1,
          text: data.response || 'Sorry, I encountered an error generating a response.',
          role: 'bot',
          timestamp: formatTime(new Date()),
          modelUsed: data.model_used
        };
        return [...filteredMessages, botMessage];
      });
      
      // Save bot message to chat history (get the message from state)
      const updatedChatId = result?.chatId || currentChatId;
      const botMessageToSave = {
        id: Date.now() + 1,
        text: data.response || 'Sorry, I encountered an error generating a response.',
        role: 'bot',
        timestamp: formatTime(new Date()),
        modelUsed: data.model_used
      };
      await ChatHistoryDB.addMessageToChat(user.id, updatedChatId, botMessageToSave);
      
      // Clear uploaded images after successful response
      if (uploadedImages.length > 0) {
        setUploadedImages([]);
        setCurrentChat(prev => ({
          ...prev,
          hasImage: false
        }));
      }
      
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== 'typing');
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Sorry, I\'m having trouble connecting to the chat service. Please try again in a moment.',
          role: 'bot',
          timestamp: formatTime(new Date()),
          isError: true
        };
        return [...filteredMessages, errorMessage];
      });
      
      // Save error message to chat history
      const updatedChatId = result?.chatId || currentChatId;
      const errorMessageToSave = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting to the chat service. Please try again in a moment.',
        role: 'bot',
        timestamp: formatTime(new Date()),
        isError: true
      };
      await ChatHistoryDB.addMessageToChat(user.id, updatedChatId, errorMessageToSave);
    }
  };

  const handleNewChat = async () => {
    if (user) {
      try {
        // Create new chat without closing the current one
        const newChat = await ChatHistoryDB.createNewChat(user.id);
        
        // Update all state atomically
        setCurrentChatId(newChat.id);
        setCurrentChat(newChat);
        setMessages([]);
        setTitleVisible(true);
        setInputValue('');
        
        // Set current chat ID in localStorage
        ChatHistoryDB.setCurrentChat(user.id, newChat.id);
        
        console.log('New chat created:', newChat.id);
      } catch (error) {
        console.error('Error creating new chat:', error);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        setIsRecording(false);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
      setMicActive(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stt/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/webm'
        },
        body: audioBlob
      });

      if (!response.ok) {
        throw new Error(`STT API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.text && data.text.trim()) {
        // Add transcribed text to input field
        setInputValue(prevValue => {
          const newValue = prevValue ? `${prevValue} ${data.text}` : data.text;
          return newValue.trim();
        });
        
        // Focus the input field
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Speech-to-text service is not available. Please make sure the STT server is running on port 5002.');
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    console.log('Starting image upload...', { files: files.length, currentChatId, userId: user?.id });
    
    try {
      // Check if we have required data
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      if (!currentChatId) {
        throw new Error('No active chat session');
      }

      let actualChatId = currentChatId;

      // If this is a temporary chat, save it to database first
      if (currentChat && currentChat.isTemporary) {
        console.log('Saving temporary chat to database first...');
        const savedChat = await ChatHistoryDB.saveChatToDatabase(user.id, currentChat);
        if (savedChat) {
          actualChatId = savedChat.id;
          // Update local state with the new chat ID
          setCurrentChatId(actualChatId);
          setCurrentChat(prev => ({
            ...prev,
            id: actualChatId,
            isTemporary: false
          }));
          // Update current chat ID in localStorage
          ChatHistoryDB.setCurrentChat(user.id, actualChatId);
          console.log('Chat saved to database with ID:', actualChatId);
        } else {
          throw new Error('Failed to save chat to database');
        }
      }

      // Upload each file
      const uploadedImages = [];
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB.');
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${actualChatId}/${Date.now()}.${fileExt}`;
        console.log('Uploading to:', fileName);
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        console.log('Upload successful:', uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        const imageUrl = urlData.publicUrl;
        console.log('Public URL:', imageUrl);

        // Save image to chat_images table
        const { data: imageRecord, error: imageInsertError } = await supabase
          .from('chat_images')
          .insert([
            {
              chat_id: actualChatId,
              user_id: user.id,
              image_url: imageUrl,
              image_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              upload_order: uploadedImages.length + 1,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (imageInsertError) {
          console.error('Error inserting image record:', imageInsertError);
          throw new Error(`Image record insert failed: ${imageInsertError.message}`);
        }

        console.log('Image record created:', imageRecord);

        // Update chat with image information (for backward compatibility)
        const { error: updateError } = await supabase
          .from('chats')
          .update({
            image_url: imageUrl,
            image_name: file.name,
            has_image: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', actualChatId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        console.log('Database updated successfully');

        // Update local state
        uploadedImages.push({
          id: imageRecord.id,
          url: imageUrl,
          name: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadOrder: imageRecord.upload_order,
          createdAt: imageRecord.created_at
        });
      }

      setUploadedImages(prev => [...prev, ...uploadedImages]);
      setCurrentChat(prev => ({
        ...prev,
        hasImage: true
      }));

      // Close dropdown
      setDropdownVisible(false);
      
      console.log('Image upload completed successfully');
      
    } catch (error) {
      console.error('Image upload error details:', error);
      alert(`Failed to upload image: ${error.message}. Please check the console for details.`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... • Chat</title>
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

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Start Menu • Chat</title>
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
            <Link href="/startmenu" className="sidebar-link active">
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
        <div className="header" style={{ display: titleVisible ? 'block' : 'none' }}>
          <h1 className="title" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.1s forwards', color: '#ffffff'}}>Welcome, {profile?.username || user?.email?.split('@')[0]}!</h1>
          <p className="subtitle" style={{opacity: 0, animation: 'fadeIn 0.3s ease-in-out 0.2s forwards'}}>Chat Away!</p>
        </div>


        <section className="chat-wrapper" aria-label="Chat interface">
          <div className="chat-card" role="region" aria-live="polite" aria-relevant="additions">
            <div className="chat-messages">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.role} ${message.isTyping ? 'typing' : ''} ${message.isError ? 'error' : ''}`}>
                  {message.text}
                  {message.role === 'bot' && !message.isTyping && (
                    <button 
                      className="listen-btn" 
                      title="Listen" 
                      aria-label="Listen to message"
                      onClick={() => handleListen(message.text, message.id)}
                    >
                      <span className="material-icons">volume_up</span>
                    </button>
                  )}
                  <span className="timestamp">
                    {message.timestamp}
                    {message.modelUsed && <span className="model-info"> • {message.modelUsed}</span>}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <form className="chat-inputbar" autoComplete="off" onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <input
                    ref={inputRef}
                    className="chat-input"
                    type="text"
                    placeholder="Type your message..."
                    aria-label="Message"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={handleInputFocus}
                    required
                  />
                  {inputValue.trim() && (
                    <button type="submit" className="send-btn-inside" aria-label="Send message">
                      <span className="material-icons">send</span>
                    </button>
                  )}
                </div>
                <div 
                  className="dropdown-arrow"
                  onMouseEnter={() => setDropdownVisible(true)}
                  onMouseLeave={() => setDropdownVisible(false)}
                >
                  <span className={`arrow-icon ${dropdownVisible ? 'arrow-up' : 'arrow-down'}`}>▼</span>
                </div>
                <button type="button" className={`mic-btn ${micActive ? 'mic-active' : ''} ${isRecording ? 'mic-recording' : ''}`} onClick={handleMicToggle} aria-label="Voice input">
                  <span className="material-icons">mic</span>
                  {isRecording && <span className="recording-indicator"></span>}
                </button>
                
                {/* Hidden file input for image upload */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  multiple
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </form>
              
              {/* Dropdown Menu */}
              <div 
                className={`dropdown-menu ${dropdownVisible ? 'dropdown-visible' : ''}`}
                onMouseEnter={() => setDropdownVisible(true)}
                onMouseLeave={() => setDropdownVisible(false)}
              >
                {!showModelSelector ? (
                  <div className="dropdown-options">
                    <button 
                      className={`dropdown-item toggle-btn ${bulbToggled ? 'toggled' : ''}`}
                      onClick={() => setBulbToggled(!bulbToggled)}
                      aria-label="Toggle bulb"
                    >
                      <img src={bulbToggled ? "/images/light-bulb-toggled-noglow.png" : "/images/light-bulb.png"} alt="Light bulb" className="dropdown-icon dropdown-image" />
                      <span className="dropdown-text">Reason</span>
                    </button>
                    
                    <button 
                      className="dropdown-item upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload image"
                      disabled={isUploading}
                    >
                      <span className="dropdown-icon">{isUploading ? '⏳' : '✚'}</span>
                      <span className="dropdown-text">{isUploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                    
                    <button 
                      className="dropdown-item model-btn"
                      onClick={() => setShowModelSelector(true)}
                      aria-label="Select AI Model"
                    >
                      <span className="material-icons dropdown-icon">model_training</span>
                      <span className="dropdown-text">Model</span>
                    </button>
                  </div>
                ) : (
                  <div className="model-selector-dropdown">
                    <div className="model-selector-header">
                      <button 
                        className="back-btn"
                        onClick={() => setShowModelSelector(false)}
                        aria-label="Go back"
                      >
                        <span className="material-icons">arrow_back</span>
                      </button>
                      <span className="model-selector-title">Select Model</span>
                    </div>
                    
                    <div className="model-options-list">
                      <button 
                        className={`model-option-item ${selectedModel === 'gemini' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedModel('gemini');
                          setShowModelSelector(false);
                          setDropdownVisible(false);
                        }}
                      >
                        <div className="model-details">
                          <span className="model-title">Gemini API</span>
                          <span className="model-description">2.0-Flash</span>
                        </div>
                        {selectedModel === 'gemini' && <span className="check-icon">✓</span>}
                      </button>
                      
                      <button 
                        className={`model-option-item ${selectedModel === 'qwen3' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedModel('qwen3');
                          setShowModelSelector(false);
                          setDropdownVisible(false);
                        }}
                      >
                        <div className="model-details">
                          <span className="model-title">Qwen3 Local</span>
                          <span className="model-description">Local processing</span>
                        </div>
                        {selectedModel === 'qwen3' && <span className="check-icon">✓</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </section>

        {/* Mini Sidebar - Right Side */}
        <div className="mini-sidebar">
          <button onClick={handleNewChat} className="sidebar-btn" title="Start New Chat">
            <img src="/images/chat_add_on_44dp.svg" alt="New Chat" className="sidebar-icon" />
            <span className="sidebar-tooltip">New Chat</span>
          </button>
          {(currentChat?.hasImage || uploadedImages.length > 0) && (
            <button 
              onClick={() => setShowImagePreview(!showImagePreview)} 
              className="sidebar-btn image-indicator" 
              title={`${uploadedImages.length} Image${uploadedImages.length > 1 ? 's' : ''} Uploaded`}
            >
              <span className="material-icons sidebar-icon">attach_file</span>
              <span className="image-count-badge">{uploadedImages.length}</span>
              <span className="sidebar-tooltip">{uploadedImages.length} Image{uploadedImages.length > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* Image Preview Window */}
        {showImagePreview && uploadedImages.length > 0 && (
          <div className="image-preview-overlay" onClick={() => setShowImagePreview(false)}>
            <div className="image-preview-window" onClick={(e) => e.stopPropagation()}>
              <div className="image-preview-header">
                <h3>Uploaded Images ({uploadedImages.length})</h3>
                <button className="preview-close-btn" onClick={() => setShowImagePreview(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="image-preview-grid">
                {uploadedImages.map((image, index) => (
                  <div key={image.id || index} className="image-preview-item">
                    <img src={image.url} alt={image.name || `Image ${index + 1}`} />
                    <div className="image-preview-info">
                      <span className="image-name">{image.name || `Image ${index + 1}`}</span>
                      <button 
                        className="remove-image-btn" 
                        onClick={() => {
                          setUploadedImages(prev => prev.filter((_, i) => i !== index));
                          if (uploadedImages.length === 1) {
                            setShowImagePreview(false);
                            setCurrentChat(prev => ({ ...prev, hasImage: false }));
                          }
                        }}
                        title="Remove image"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        /* Base and theme */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow: hidden; background: #000000; color: #ffffff; height: 100%; }
        img, video, canvas { max-width: 100%; height: auto; }
        .container { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }

        /* Top Navigation */
        .site-nav { position: sticky; top: 0; z-index: 40; background: inherit; padding: 12px 20px; }
        .site-nav_inner { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
        .site-nav_brand { font-family: "Fjalla One", sans-serif; font-size: 1.125rem; letter-spacing: 0.02em; color: #7a7a7a; text-decoration: none; }
        .site-nav_links { display: flex; gap: 16px; }
        .site-nav_link { font-family: "Source Sans 3", sans-serif; color: #7a7a7a; text-decoration: none; font-size: 0.975rem; }
        .site-nav_link:hover, .site-nav_brand:hover { color: #5f5f5f; }
        .logout-btn { background: none; border: none; cursor: pointer; font-family: "Source Sans 3", sans-serif; color: #7a7a7a; font-size: 0.975rem; }
        .logout-btn:hover { color: #5f5f5f; }

        /* New Chat Button - Top Right Floating */
        .new-chat-floating {
          position: fixed;
          top: 70px;
          right: 20px;
          z-index: 100;
        }

        .new-chat-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
          gap: 8px;
        }

        .new-chat-btn:hover {
          color: #4caf50;
        }

        .new-chat-icon {
          width: 24px;
          height: 24px;
          transition: filter 0.3s ease;
          flex-shrink: 0;
          filter: brightness(0) invert(1);
          line-height: 1;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
          background: transparent;
          border-radius: 50%;
          padding: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .new-chat-btn:hover .new-chat-icon {
          filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(90deg);
          transform: scale(1.1);
        }

        .new-chat-text {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;

          font-size: 0.9rem;
          margin-left: 8px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .new-chat-btn:hover .new-chat-text {
          opacity: 1;
          transform: translateX(0);
        }

        /* Image Attached Button */
        .image-attached-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
          gap: 4px;
          margin-top: 8px;
        }

        .image-attached-btn:hover {
          color: #4caf50;
        }

        .image-attached-icon {
          width: 24px;
          height: 24px;
          transition: filter 0.2s ease;
          flex-shrink: 0;
          filter: brightness(0) invert(1);
          font-size: 24px !important;
          line-height: 1;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
          background: transparent;
          border-radius: 50%;
          padding: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-attached-btn:hover .image-attached-icon {
          filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(90deg);
          transform: scale(1.1);
        }

        .image-attached-text {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          color: #4caf50;
          font-size: 0.9rem;
          margin-left: 4px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .image-attached-btn:hover .image-attached-text {
          opacity: 1;
          transform: translateX(0);
        }

        /* Mini Sidebar - Right Side */
        .mini-sidebar {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .sidebar-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: visible;
        }

        .sidebar-btn:hover {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.4);
          transform: translateX(-4px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .sidebar-icon {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .sidebar-btn:hover .sidebar-icon {
          filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(90deg);
          transform: scale(1.1);
        }

        .sidebar-tooltip {
          position: absolute;
          right: 100%;
          margin-right: 12px;
          background: rgba(0, 0, 0, 0.95);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 8px;
          font-family: "Source Sans 3", sans-serif;
          font-size: 0.875rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transform: translateX(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          z-index: 1000;
        }

        .sidebar-tooltip::before {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: rgba(0, 0, 0, 0.95);
        }

        .sidebar-btn:hover .sidebar-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* Image Count Badge */
        .image-count-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: #ffffff;
          font-family: "Source Sans 3", sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          border: 2px solid #000000;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.6);
          }
        }

        .image-indicator {
          position: relative;
        }

        /* Image Preview Window */
        .image-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .image-preview-window {
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .image-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .image-preview-header h3 {
          margin: 0;
          font-family: "Fjalla One", sans-serif;
          font-size: 1.25rem;
          color: #ffffff;
        }

        .preview-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preview-close-btn:hover {
          background: rgba(255, 59, 48, 0.2);
          border-color: rgba(255, 59, 48, 0.4);
        }

        .preview-close-btn .material-icons {
          font-size: 20px;
          color: #ffffff;
        }

        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
        }

        .image-preview-item {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .image-preview-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          border-color: rgba(76, 175, 80, 0.4);
        }

        .image-preview-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .image-preview-info {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .image-name {
          font-family: "Source Sans 3", sans-serif;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .remove-image-btn {
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .remove-image-btn:hover {
          background: rgba(255, 59, 48, 0.3);
          border-color: rgba(255, 59, 48, 0.5);
          transform: scale(1.1);
        }

        .remove-image-btn .material-icons {
          font-size: 18px;
          color: #ff3b30;
        }

        /* Scrollbar for preview window */
        .image-preview-window::-webkit-scrollbar {
          width: 8px;
        }

        .image-preview-window::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .image-preview-window::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .image-preview-window::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Header */
        .header { text-align: center; padding: 16px 20px 0; }
        .title { font-family: "Fjalla One", sans-serif; font-size: clamp(2rem, 6vw, 3rem); margin: 0 0 8px; letter-spacing: 0.04em; }
        .subtitle { font-family: "Source Sans 3", sans-serif; color: rgba(255,255,255,0.85); margin: 0; }

        /* New Chat Floating Button */
        .new-chat-floating {
          position: fixed;
          top: 40px;
          right: 20px;
          z-index: 100;
        }

        .new-chat-fab {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 50px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          backdrop-filter: blur(10px);
          overflow: hidden;
          width: 48px;
          height: 48px;
          justify-content: center;
        }

        .new-chat-fab:hover {
          background: #222;
          border-color: rgba(76, 175, 80, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          width: auto;
          padding: 12px 20px 12px 12px;
        }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }

        .new-chat-icon {
          width: 24px;
          height: 24px;
          transition: filter 0.3s ease;
          flex-shrink: 0;
          filter: brightness(0) invert(1);
          line-height: 1;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
          background: transparent;
          border-radius: 50%;
          padding: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .new-chat-btn:hover .new-chat-icon {
          filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(90deg);
          transform: scale(1.1);
        }

        .new-chat-text {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          color: #4caf50;
          font-size: 0.9rem;
          margin-left: 8px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .new-chat-btn:hover .new-chat-text {
          opacity: 1;
          transform: translateX(0);
        }

        /* Chat layout */
        .chat-wrapper { position: fixed; left: 0; right: 0; bottom: 0; padding: 12px 20px; }
        .chat-card { background: #000000; border: none; border-radius: 12px; display: grid; grid-template-rows: 1fr auto; overflow: hidden; max-width: 1200px; margin: 0 auto; height: 75vh; padding-bottom: 20px; }
        .chat-messages { padding: 16px; overflow: auto; scroll-behavior: smooth; }
        .chat-messages::-webkit-scrollbar { display: none; }
        .chat-messages { -ms-overflow-style: none; scrollbar-width: none; }
        .message { max-width: min(85%, 720px); padding: 10px 12px; border-radius: 10px; margin: 8px 0; line-height: 1.45; font-family: "Source Sans 3", sans-serif; font-size: 1rem; position: relative; }
        .message.user { margin-left: auto; background: rgba(255,255,255,0.06); color: #ffffff; border: 1px solid rgba(255,255,255,0.08); }
        .message.bot { margin-right: auto; background: rgba(255,255,255,0.03); color: #d4d4d4; border: 1px solid rgba(255,255,255,0.06); }
        .message.bot.typing { background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); animation: pulse 2s infinite; }
        .message.bot.error { background: rgba(244, 67, 54, 0.1); border: 1px solid rgba(244, 67, 54, 0.3); }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .timestamp { display: block; margin-top: 6px; font-size: 0.75rem; opacity: 0.6; }
        .model-info { font-size: 0.7rem; opacity: 0.5; font-style: italic; }

        /* Listen Button Styles */
        .listen-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .listen-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }

        .listen-btn .material-icons {
          font-size: 14px;
          line-height: 1;
        }

        .message.bot:hover .listen-btn {
          opacity: 1;
          visibility: visible;
        }

        /* Ensure bot messages have enough padding for the listen button */
        .message.bot {
          padding-right: 36px;
        }

        /* Chat Input Container */
        .chat-input-container {
          position: relative;
          transition: transform 0.3s ease;
        }


        .chat-inputbar { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; padding: 16px 20px; margin: 0 16px; border-radius: 8px; z-index: 30; position: relative; }
        
        .input-wrapper { position: relative; width: 100%; }
        .chat-input { width: 100%; background: #0f0f0f; color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; padding-right: 50px; font-size: 1rem; font-family: "Source Sans 3", sans-serif; transition: all 0.2s ease; }
        .chat-input::placeholder { color: #8a8a8a; }
        .chat-input:focus { outline: none; border-color: rgba(255,255,255,0.2); background: #1a1a1a; }
        
        .send-btn-inside { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color:rgb(255, 255, 255); cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
        .send-btn-inside:hover { background: rgba(255,255,255,0.1); color:rgb(255, 255, 255); transform: translateY(-50%) scale(1.1); }
        .send-btn-inside .material-icons { font-size: 20px; }
        
        .mic-btn { background: #1a1a1a; color: #cfcfcf; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
        .mic-btn:hover { background: #222; color: #fff; transform: translateY(-1px); }
        .mic-btn.mic-active { background: #dc3545; color: #fff; border-color: #dc3545; }
        .mic-btn.mic-active:hover { background: #c82333; }
        .mic-btn.mic-recording { background: #4caf50; color: #fff; border-color: #4caf50; animation: pulse 1s infinite; }
        .mic-btn.mic-recording:hover { background: #3e8e41; }
        .mic-btn .material-icons { font-size: 20px; }

        /* Dropdown Arrow in Input Bar */
        .dropdown-arrow {
          cursor: pointer;
          padding: 12px 16px;
          background: #1a1a1a;
          color: #cfcfcf;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-arrow:hover {
          background: #222;
          color: #fff;
          transform: translateY(-1px);
        }

        .arrow-icon {
          font-size: 0.75rem;
          transition: transform 0.3s ease;
        }

        .arrow-up {
          transform: rotate(180deg);
        }

        /* Dropdown Menu */
        .dropdown-menu {
          position: absolute;
          bottom: 80%;
          right: 0;
          transform: translateY(10px);
          width: 200px;
          backdrop-filter: blur(10px);
          padding: 8px 10px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          margin-bottom: -2px;
        }

        .dropdown-visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* Dropdown Options Container */
        .dropdown-options {
          display: flex;
          gap: 2px;
          justify-content: center;
        }

        .dropdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 10px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 30px;
          flex: 1;
          max-width: 40px;
        }

        .dropdown-item:hover {
          background: none;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .dropdown-icon {
          font-size: 1rem;
          line-height: 1;
        }

        .dropdown-image {
          width: 1rem;
          height: 1rem;
          object-fit: contain;
          filter: brightness(0.8);
          transition: all 0.2s ease;
          display: block;
          margin: 0 auto;
        }

        .toggle-btn.toggled .dropdown-image {
          filter: brightness(1.2);
        }

        .dropdown-item:hover .dropdown-image {
          filter: brightness(1.1);
        }

        .toggle-btn.toggled:hover .dropdown-image {
          filter: brightness(1.3);
        }

        .dropdown-text {
          white-space: nowrap;
          font-weight: 500;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.2s ease;
          font-size: 0.7rem;
        }

        .dropdown-item:hover .dropdown-text {
          opacity: 1;
          transform: translateY(0);
        }

        .toggle-btn.toggled {
          background: none;
          color: #ffc107;
        }

        .toggle-btn.toggled:hover {
          background: none;
        }

        .upload-btn:hover .dropdown-icon {
          transform: scale(1.1);
        }

        /* Model Selector in Dropdown Styles */
        .model-selector-dropdown {
          padding: 6px;
          min-width: 180px;
        }

        .model-selector-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 2px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 6px;
        }

        .back-btn {
          background: none;
          border: none;
          color: #7a7a7a;
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .back-btn .material-icons {
          font-size: 16px;
        }

        .model-selector-title {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          color: #ffffff;
          font-size: 0.8rem;
        }

        .model-options-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .model-option-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 6px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
        }

        .model-option-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(1px);
        }

        .model-option-item.selected {
          background: rgba(76, 175, 80, 0.15);
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .model-option-item.selected:hover {
          background: rgba(76, 175, 80, 0.2);
        }

        .model-icon {
          font-size: 14px;
          line-height: 1;
        }

        .model-details {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
        }

        .model-title {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 600;
          color: #ffffff;
          font-size: 0.75rem;
          line-height: 1.2;
        }

        .model-description {
          font-family: "Source Sans 3", sans-serif;
          font-weight: 400;
          color: #7a7a7a;
          font-size: 0.65rem;
          line-height: 1.2;
        }

        .check-icon {
          color: #4caf50;
          font-weight: bold;
          font-size: 12px;
          flex-shrink: 0;
        }

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
          .message { font-size: 0.975rem; }
          
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

        /* Recording Indicator */
        .recording-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #ff4444;
          border-radius: 50%;
          animation: recordingPulse 1s infinite;
          border: 2px solid #fff;
        }

        @keyframes recordingPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Mic button positioning for indicator */
        .mic-btn {
          position: relative;
        }

        /* Image Uploaded Icon */
        .image-uploaded-icon {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 16px !important;
          color: #4caf50 !important;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 50%;
          padding: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #000;
          animation: imageUploadPulse 2s infinite;
        }
      `}</style>
    </>
  );
}