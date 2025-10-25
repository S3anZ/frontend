import Head from 'next/head';
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatHistoryDB } from '../lib/chatHistoryDB';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState({
    chatsStarted: 0,
    totalModels: 2,
    totalUsers: 1,
    totalUsageTime: '0h 0m'
  });

  useEffect(() => {
    setIsLoaded(true);
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      // Load global statistics from all users
      const globalStats = await loadGlobalStats();
      setStats(globalStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to default values
      setStats({
        chatsStarted: 0,
        totalModels: 2,
        totalUsers: 5,
        totalUsageTime: '0m'
      });
    }
  };

  const loadGlobalStats = async () => {
    try {
      // Query actual database for real statistics
      
      // Get total users count from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      const totalUsers = profilesData ? profilesData.length : 5; // Fallback to 5 as mentioned
      
      // Get total chats across all users
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('id', { count: 'exact' });
      
      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
      }
      
      const totalChats = chatsData ? chatsData.length : 0;
      
      // Get total messages across all chats
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id', { count: 'exact' });
      
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }
      
      const totalMessages = messagesData ? messagesData.length : 0;
      
      // Calculate total usage time based on actual message count
      const totalMinutes = Math.floor(totalMessages * 0.5); // 30 seconds per message
      const totalHours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      let usageTimeDisplay;
      if (totalHours >= 1000) {
        usageTimeDisplay = `${(totalHours / 1000).toFixed(1)}K hours`;
      } else if (totalHours > 0) {
        usageTimeDisplay = `${totalHours}h ${minutes}m`;
      } else {
        usageTimeDisplay = `${minutes}m`;
      }
      
      return {
        chatsStarted: totalChats,
        totalModels: 2, // Gemini + Qwen3
        totalUsers: totalUsers,
        totalUsageTime: usageTimeDisplay
      };
    } catch (error) {
      console.error('Error calculating global stats:', error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Home</title>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="Next.js" name="generator" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          href="https://fonts.gstatic.com"
          rel="preconnect"
          crossOrigin="anonymous"
        />
        <link href="imageshome/favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="imageshome/app-icon.png" rel="apple-touch-icon" />
      </Head>

      <style jsx>{`
        .section {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        header.section {
          padding: 60px 0 !important;
        }
        
        .w-layout-grid {
          gap: 0 !important;
        }
        
        .w-layout-grid.grid_4-col.gap-xsmall {
          gap: 8px !important;
        }
        
        .section.is-inverse .w-layout-grid.grid_4-col.gap-xsmall > * {
          margin: 0 !important;
        }
        
        .section.is-inverse .image-ratio_1x1,
        .section.is-inverse .image_cover {
          margin: 0 !important;
          display: block;
        }
        
        .container {
          padding: 40px 20px !important;
        }
        
        .section.is-secondary {
          padding: 40px 0 !important;
        }
        
        .section.is-inverse {
          padding: 40px 0 !important;
        }
        
        .footer {
          padding: 60px 0 40px !important;
        }
        
        .w-layout-grid {
          display: grid;
        }
        
        .grid_5-col {
          grid-template-columns: 1fr 2fr 1fr;
        }
        
        .grid_4-col {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .grid_3-col {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .grid_2-col {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .gap-small {
          gap: 12px;
        }
        
        .gap-medium {
          gap: 16px;
        }
        
        .gap-xsmall {
          gap: 6px;
        }
        
        .gap-xxlarge {
          gap: 32px;
        }
        
        .margin-bottom_small {
          margin-bottom: 8px;
        }
        
        .image-ratio_3x2 {
          margin-bottom: 8px;
        }
        
        .grid_2-col > div {
          margin-bottom: 0;
        }
        
        .grid_2-col > div > * {
          margin-bottom: 8px;
        }
        
        .grid_2-col > div > *:last-child {
          margin-bottom: 0;
        }
        
        .section .header {
          padding: 40px 0;
        }
        
        .header.max-width_large {
          margin-bottom: 16px;
        }
        
        .header.is-align-center {
          margin-bottom: 12px;
        }
        
        .section .header {
          margin-bottom: 12px;
        }
        
        @media (max-width: 768px) {
          .section .header {
            padding: 20px 0;
          }
          header.section {
            padding: 40px 0;
          }
          .tablet-1-col {
            grid-template-columns: 1fr !important;
          }
          .mobile-l-1-col {
            grid-template-columns: 1fr !important;
          }
        }
        
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .button:hover {
          transform: translateY(-1px);
        }
        
        .grid_2-col {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .grid_3-col {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .grid_4-col {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .grid_5-col {
          grid-template-columns: repeat(5, 1fr);
        }
        
        .gap-small {
          gap: 16px;
        }
        
        .gap-medium {
          gap: 24px;
        }
        
        .gap-xsmall {
          gap: 8px;
        }
        
        .gap-xxlarge {
          gap: 64px;
        }
        
        .fade-in {
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
        
        .fade-in.loaded {
          opacity: 1;
        }
        
        @media (max-width: 991px) {
          .grid_5-col,
          .grid_4-col,
          .grid_3-col,
          .grid_2-col {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }
        
        @media (max-width: 767px) {
          .grid_5-col,
          .grid_4-col,
          .grid_3-col,
          .grid_2-col {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          
          .section {
            padding: 60px 0;
          }
        }
      `}</style>

      <div className={`fade-in ${isLoaded ? 'loaded' : ''}`}>
        {/* Navigation */}
        <div className="nav">
          <div className="nav_container w-nav">
            <div className="nav_left">
              <Link href="/" className="nav_logo w-inline-block">
                <div className="nav_logo-icon">
                  <svg width="100%" height="100%" viewBox="0 0 33 33" preserveAspectRatio="xMidYMid meet">
                    <path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"></path>
                  </svg>
                </div>
                <div className="paragraph_large margin-bottom_none">Conversational Chatbot</div>
              </Link>
            </div>
            <div className="nav_center">
              <nav role="navigation" className="nav_menu w-nav-menu">
                <ul role="list" className="nav_menu-list w-list-unstyled">
                </ul>
              </nav>
            </div>
            <div className="nav_right">
              <div className="button-group margin-top_none">
                {!user ? (
                  <Link href="/login" className="button w-inline-block">
                    <div className="button_label">Sign-Up</div>
                  </Link>
                ) : (
                  <Link href="/profile" className="button w-inline-block">
                    <div className="button_label">Profile</div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="section">
          <div className="container">
            <div className="w-layout-grid grid_5-col tablet-1-col gap-small">
              <div id="w-node-_010073c1-70e4-a042-4d42-daf3039f8dab-3483d0ed" className="image-ratio_1x1 w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad458-12b829b2">
                <img 
                  width="736" 
                  height="736" 
                  alt="interface image of employee interacting with hr software" 
                  src="/imageshome/5b04ae2a-07df-4c49-896e-661769b9e168.avif" 
                  loading="lazy" 
                  id="w-node-e9a6b330-6fef-7830-0b0b-04033483d0f1-3483d0ed"
                  className="image_cover mask_left w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad457-12b829b2"
                />
              </div>
              <div id="w-node-e9a6b330-6fef-7830-0b0b-04033483d0f2-3483d0ed" className="header margin-bottom_none w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad462-12b829b2">
                <h1 className="heading_h1">Real conversations, real connection, anytime</h1>
                <p className="subheading">Feeling alone? Chat with a caring, customizable companion, always ready to listen, share, and support. Choose a personality that fits your needs, from a friendly confidant to a helpful expert. You're part of a welcoming community here.</p>
                <div className="button-group">
                  <Link href="/startmenu" className="button w-button">Chat now</Link>
                  <Link href="/" className="button is-secondary w-button">Explore</Link>
                </div>
              </div>
              <div id="w-node-e9a6b330-6fef-7830-0b0b-04033483d0fe-3483d0ed" className="w-layout-grid grid_4-col gap-small w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad47f-12b829b2">
                <div id="w-node-e9a6b330-6fef-7830-0b0b-04033483d0ff-3483d0ed" className="w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad469-12b829b2">
                  <h3>{stats.chatsStarted.toLocaleString()}</h3>
                  <div className="paragraph_small">Chats Started</div>
                  <div className="paragraph_small text-color_secondary">Conversations initiated by you</div>
                </div>
                <div id="w-node-_796702ac-0e07-9528-1815-c1020550093c-3483d0ed" className="w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad470-12b829b2">
                  <h3>{stats.totalModels}</h3>
                  <div className="paragraph_small">Total Models</div>
                  <div className="paragraph_small text-color_secondary">AI models available for chat</div>
                </div>
                <div id="w-node-c7bb7004-2995-4191-9465-c621b548d54b-3483d0ed" className="w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad477-12b829b2">
                  <h3>{stats.totalUsers}</h3>
                  <div className="paragraph_small">Total Users</div>
                  <div className="paragraph_small text-color_secondary">Registered users on the platform</div>
                </div>
                <div id="w-node-_28636012-7713-a46f-7d7f-bc437d4de364-3483d0ed" className="w-node-_1b6ff92f-3b46-c096-bdbd-5252adfad47e-12b829b2">
                  <h3>{stats.totalUsageTime}</h3>
                  <div className="paragraph_small">Total Usage Time</div>
                  <div className="paragraph_small text-color_secondary">Time spent chatting with AI</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Secondary Section with Logos */}
        <section className="section is-secondary">
          <div className="container">
            <div className="w-layout-grid grid_2-col gap-xxlarge mobile-l-1-col">
              <div className="header margin-bottom_none">
                <h3 className="heading_h3">Conversations that care, anytime</h3>
                <p className="subheading">Step into a space where every chat feels like a friend reaching out. Whether you're looking for a listening ear or expert guidance, our chatbot adapts to your needs, always here, always understanding. Join a welcoming community where your voice matters.</p>
              </div>
              <div className="w-layout-grid grid_3-col is-y-center gap-small">
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 54 16" fill="none">
                    <path d="M19.4,5.4h1.3v5.1h4v1.1h-5.3v-6.2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 54 16" fill="none">
                    <path d="M17.4,5.4h5.8v1h-4.5v1.6h3.5v.8h-3.5v1.7h4.5v1h-5.8v-6.2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 54 16" fill="none">
                    <path d="M24.4,5.4h2.6c1.5,0,2.4.8,2.4,2.2s-.8,2.1-2.3,2.1h-1.6v1.9h-1.1v-6.2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 54 16" fill="none">
                    <path d="M22,4.7h1.4v6.9h-1.4v-6.9Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 54 16" fill="none">
                    <path d="M16.1,9.4c0-.2,0-.4,0-.5h1.1c0,.2,0,.3,0,.3,0,.8.5,1.3,1.5,1.3s1.6-.5,1.6-1.2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 54 16" fill="none">
                    <path d="M13,4.5h4.5v1h-3.3v1.9h2.6v.8h-2.6v1.9h3.4v1h-4.6v-6.6Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="section">
          <div className="container">
            <div className="header max-width_large">
              <h2>Chat with empathy, connect with ease</h2>
              <p className="paragraph_large text-color_secondary">
                Feeling alone? Our chatbot is here to listen, support, and adapt to
                your needs, whether you want a friendly chat or expert advice. You're
                never on your own here.
              </p>
            </div>
            <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
              <div>
                <div className="image-ratio_3x2 margin-bottom_small">
                  <img
                    alt="interface image of a learning module"
                    src="/imageshome/1e7c874b-5fbb-4579-a6a8-e96957252c10.avif"
                    loading="lazy"
                    className="image image_cover"
                  />
                </div>
                <div className="paragraph_small text-color_secondary">Support</div>
                <h3 className="heading_h4">A caring companion, anytime</h3>
                <p>Start a conversation whenever you need to talk. Our chatbot listens, understands, and responds with warmth, just like a real friend.</p>
              </div>
              <div>
                <div className="image-ratio_3x2 margin-bottom_small">
                  <img
                    alt="background image of cozy reading nook"
                    src="/imageshome/81a461f8-4562-44eb-bc10-f383780f8704.avif"
                    loading="lazy"
                    className="image image_cover"
                  />
                </div>
                <div className="paragraph_small text-color_secondary">Expertise</div>
                <h3 className="heading_h4">Custom advice, your way</h3>
                <p>Choose a professional persona, doctor, engineer, or more. Get thoughtful, tailored responses that make you feel heard and understood.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section 2 */}
        <section className="section is-secondary">
          <div className="container">
            <div className="header max-width_large">
              <h2>Chat that feels like home</h2>
              <p className="paragraph_large text-color_secondary">Experience genuine connection anytime you need it. Our chatbot listens, adapts, and brings warmth to every conversation. Whether you're seeking a friendly ear or expert support. You belong here.</p>
            </div>
            <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
              <div>
                <div className="image-ratio_3x2 margin-bottom_small">
                  <img 
                    width="608" 
                    height="405" 
                    alt="image of networking event" 
                    src="/imageshome/7824bcff-878c-48d3-a514-2396ddcd91a1.avif" 
                    loading="lazy" 
                    className="image image_cover"
                  />
                </div>
                <div className="paragraph_small text-color_secondary">Compassionate company</div>
                <h3 className="heading_h4">Always here for you</h3>
                <p>Reach out whenever you like. Enjoy heartfelt chats, share your thoughts, or simply unwind with a caring companion. No pressure, just understanding and kindness.</p>
              </div>
              <div>
                <div className="image-ratio_3x2 margin-bottom_small">
                  <img 
                    width="608" 
                    height="405" 
                    alt="image of networking event" 
                    src="/imageshome/8ddfcfe1-d992-4f35-9524-cadd77479dd0.avif" 
                    loading="lazy" 
                    className="image image_cover"
                  />
                </div>
                <div className="paragraph_small text-color_secondary">Professional insight</div>
                <h3 className="heading_h4">Expert help, your style</h3>
                <p>Pick a role. Doctor, engineer, or more. Get thoughtful, personalized advice and feel empowered in every conversation, no matter your question.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid Section */}
        <section className="section is-inverse">
          <div className="container">
            <div className="header is-align-center">
              <h2 className="heading_h2">Real conversations, real connection</h2>
              <p className="subheading">Discover stories, tips, and expert advice to help you feel heard, supported, and inspired wherever you are.</p>
            </div>
            <div className="w-layout-grid grid_4-col gap-xsmall">
              <Link href="/404" className="content-block-link w-inline-block">
                <div className="image-ratio_1x1 margin-bottom_xsmall">
                  <img 
                    width="384" 
                    height="384" 
                    alt="interface" 
                    src="/imageshome/61c72b85-56c1-480f-8e27-aba0cbfde48e.avif" 
                    loading="lazy" 
                    className="image_cover"
                  />
                </div>
                <div className="eyebrow">Mental health</div>
                <h3 className="heading_h4">Loneliness: finding comfort</h3>
                <p>Explore heartfelt ways to ease isolation, with relatable stories and practical advice to help you feel less alone.</p>
              </Link>
              <Link href="/404" className="content-block-link w-inline-block">
                <div className="image-ratio_1x1 margin-bottom_xsmall">
                  <img 
                    width="384" 
                    height="384" 
                    alt="interface image of a screenshot of a learning module" 
                    src="/imageshome/25dab04c-a331-4a73-b810-9198ebf4fe34.avif" 
                    loading="lazy" 
                    className="image_cover"
                  />
                </div>
                <div className="eyebrow">Technology</div>
                <h3 className="heading_h4">Chatbots: your digital companion</h3>
                <p>See how AI chat can offer support, guidance, and a friendly ear anytime you need to talk.</p>
              </Link>
              <Link href="/404" className="content-block-link w-inline-block">
                <div className="image-ratio_1x1 margin-bottom_xsmall">
                  <img 
                    width="384" 
                    height="384" 
                    alt="image of ai education seminar" 
                    src="/imageshome/2e546ad2-b65c-4c37-a36a-e4da2f0a6573.avif" 
                    loading="lazy" 
                    className="image_cover"
                  />
                </div>
                <div className="eyebrow">Community</div>
                <h3 className="heading_h4">Building your support network</h3>
                <p>Learn how to connect with others, join welcoming groups, and make new friends in safe digital spaces.</p>
              </Link>
              <Link href="/404" className="content-block-link w-inline-block">
                <div className="image-ratio_1x1 margin-bottom_xsmall">
                  <img 
                    width="384" 
                    height="384" 
                    alt="interface image of employee interacting with hr software" 
                    src="/imageshome/7b7da15e-64d3-42b0-bde7-171f2277e784.avif" 
                    loading="lazy" 
                    className="image_cover"
                  />
                </div>
                <div className="eyebrow">Inspiration</div>
                <h3 className="heading_h4">Hopeful journeys, shared growth</h3>
                <p>Be uplifted by real stories of people who found strength, joy, and belonging through conversation.</p>
              </Link>
              <Link href="/404" className="content-block-link w-inline-block">
                <div className="image-ratio_1x1 margin-bottom_xsmall">
                  <img 
                    width="384" 
                    height="384" 
                    alt="cozy reading nook" 
                    src="/imageshome/81a461f8-4562-44eb-bc10-f383780f8704.avif" 
                    loading="lazy" 
                    className="image_cover"
                  />
                </div>
                <div className="eyebrow">Well-being</div>
                <h3 className="heading_h4">Everyday self-care made simple</h3>
                <p>Try easy, effective self-care routines to recharge, reflect, and nurture your well-being, wherever life takes you.</p>
              </Link>
              <Link href="/404" className="content-block-link w-inline-block">
                <div className="image-ratio_1x1 margin-bottom_xsmall">
                  <img 
                    width="384" 
                    height="384" 
                    alt="interface image of employee interacting with hr software" 
                    src="/imageshome/18399f41-52a7-45b5-b574-7e881dfe9e7f.avif" 
                    loading="lazy" 
                    className="image_cover"
                  />
                </div>
                <div className="eyebrow">Expert advice</div>
                <h3 className="heading_h4">Ask a pro, anytime</h3>
                <p>Get thoughtful answers from doctors, engineers, and more personalized support for your unique questions.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section">
          <div className="container">
            <div className="header">
              <div className="eyebrow">Your questions, answered</div>
              <h2>Chatbot FAQ: All you need to know</h2>
              <p className="subheading">Wondering how our chatbot can brighten your day or offer a listening ear? Explore these common questions to see how easy it is to connect, share, and feel supported—whenever you need it.</p>
            </div>
            <div className="w-layout-grid grid_3-col gap-medium">
              <div className="padding-left_medium divider-vertical padding-top_xxsmall">
                <h3 className="heading_h4">How does chatting here feel?</h3>
                <div className="rich-text w-richtext">
                  <p>Our chatbot listens with care and responds in real time, just like a thoughtful friend. Whether you want to share a story or seek advice, it's always ready to connect and adapt to your mood.</p>
                </div>
              </div>
              <div className="padding-left_medium divider-vertical padding-top_xxsmall">
                <h3 className="heading_h4">Can I change how it responds?</h3>
                <div className="rich-text w-richtext">
                  <p>Yes! Choose a personality that fits your needs—like a supportive doctor, a creative engineer, or a friendly companion. Make every conversation feel just right for you.</p>
                </div>
              </div>
              <div className="padding-left_medium divider-vertical padding-top_xxsmall">
                <h3 className="heading_h4">Will my chats stay private?</h3>
                <div className="rich-text w-richtext">
                  <p>Absolutely. Every conversation is confidential and secure. You can open up freely, knowing your words are safe and never shared.</p>
                </div>
              </div>
              <div className="padding-left_medium divider-vertical padding-top_xxsmall">
                <h3 className="heading_h4">Who is this chatbot for?</h3>
                <div className="rich-text w-richtext">
                  <p>Everyone is welcome here. Whether you're feeling lonely, need encouragement, or just want to talk, our chatbot is here to support you—no matter who you are.</p>
                </div>
              </div>
              <div className="padding-left_medium divider-vertical padding-top_xxsmall">
                <h3 className="heading_h4">What can I talk about?</h3>
                <div className="rich-text w-richtext">
                  <p>Share anything on your mind, big or small. From daily moments to deeper feelings, the chatbot is here to listen and respond with warmth and understanding.</p>
                </div>
              </div>
              <div className="padding-left_medium divider-vertical padding-top_xxsmall">
                <h3 className="heading_h4">How do I start chatting?</h3>
                <div className="rich-text w-richtext">
                  <p>Just say hello! No setup needed. Begin a conversation, ask a question, or share a thought—the chatbot will guide you every step of the way.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer position_relative is-inverse">
          <div className="container">
            <div className="header">
              <h2 className="heading_h2 margin-bottom_none">Here for you, day or night</h2>
              <Link href="/404" className="footer_link on-inverse w-inline-block">
                <div className="heading_h2">WorkinProgress@mail.com</div>
              </Link>
            </div>
            <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
              <div>
                <div className="subheading">Never feel alone—reach out anytime for a chat, advice, or just someone to listen. We're always here to support you, no matter what you need.</div>
                <Link href="/startmenu" className="button on-inverse w-button">Try It</Link>
              </div>
              <div className="w-layout-grid grid_2-col gap-small">
                <ul role="list" className="margin-bottom_none w-list-unstyled">
                  <li><h2 className="heading_h6 text-color_secondary">Support</h2></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Help</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>FAQ</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Contact</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Guides</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Blog</div></Link></li>
                </ul>
                <ul role="list" className="margin-bottom_none w-list-unstyled">
                  <li><h2 className="heading_h6 text-color_secondary">Company</h2></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>About</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Team</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Careers</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Press</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Legal</div></Link></li>
                </ul>
                <ul role="list" className="margin-bottom_none w-list-unstyled">
                  <li><h2 className="heading_h6 text-color_secondary">Resources</h2></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Docs</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>API</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Partners</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Events</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Updates</div></Link></li>
                </ul>
                <ul role="list" className="margin-bottom_none w-list-unstyled">
                  <li><h2 className="heading_h6 text-color_secondary">Community</h2></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Forum</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Stories</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Ambassadors</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Newsletter</div></Link></li>
                  <li><Link href="/404" className="footer_link on-inverse w-inline-block"><div>Feedback</div></Link></li>
                </ul>
              </div>
            </div>
            <div className="footer_bottom-3-col">
              <Link href="/" className="logo w-inline-block">
                <div className="nav_logo-icon">
                  <svg width="100%" height="100%" viewBox="0 0 33 33" preserveAspectRatio="xMidYMid meet">
                    <path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"></path>
                  </svg>
                </div>
                <div className="paragraph_xlarge margin-bottom_none text_all-caps">Conversational Chatbot</div>
              </Link>
              <ul role="list" aria-label="Social media links" className="footer_icon-group w-list-unstyled">
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_icon-link w-inline-block">
                    <svg width="100%" height="100%" viewBox="0 0 16 16">
                      <path d="M16,8.048a8,8,0,1,0-9.25,7.9V10.36H4.719V8.048H6.75V6.285A2.822,2.822,0,0,1,9.771,3.173a12.2,12.2,0,0,1,1.791.156V5.3H10.554a1.155,1.155,0,0,0-1.3,1.25v1.5h2.219l-.355,2.312H9.25v5.591A8,8,0,0,0,16,8.048Z" fill="currentColor"></path>
                    </svg>
                    <div className="screen-reader">Facebook</div>
                  </Link>
                </li>
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_icon-link w-inline-block">
                    <svg width="100%" height="100%" viewBox="0 0 16 16">
                      <path d="M8,1.441c2.136,0,2.389.009,3.233.047a4.419,4.419,0,0,1,1.485.276,2.472,2.472,0,0,1,.92.6,2.472,2.472,0,0,1,.6.92,4.419,4.419,0,0,1,.276,1.485c.038.844.047,1.1.047,3.233s-.009,2.389-.047,3.233a4.419,4.419,0,0,1-.276,1.485,2.644,2.644,0,0,1-1.518,1.518,4.419,4.419,0,0,1-1.485.276c-.844.038-1.1.047-3.233.047s-2.389-.009-3.233-.047a4.419,4.419,0,0,1-1.485-.276,2.472,2.472,0,0,1-.92-.6,2.472,2.472,0,0,1-.6-.92,4.419,4.419,0,0,1-.276-1.485c-.038-.844-.047-1.1-.047-3.233s.009-2.389.047-3.233a4.419,4.419,0,0,1,.276-1.485,2.472,2.472,0,0,1,.6-.92,2.472,2.472,0,0,1,.92-.6,4.419,4.419,0,0,1,1.485-.276c.844-.038,1.1-.047,3.233-.047M8,0C5.827,0,5.555.009,4.7.048A5.868,5.868,0,0,0,2.76.42a3.908,3.908,0,0,0-1.417.923A3.908,3.908,0,0,0,.42,2.76,5.868,5.868,0,0,0,.048,4.7C.009,5.555,0,5.827,0,8s.009,2.445.048,3.3A5.868,5.868,0,0,0,.42,13.24a3.908,3.908,0,0,0,.923,1.417,3.908,3.908,0,0,0,1.417.923,5.868,5.868,0,0,0,1.942.372C5.555,15.991,5.827,16,8,16s2.445-.009,3.3-.048a5.868,5.868,0,0,0,1.942-.372,4.094,4.094,0,0,0,2.34-2.34,5.868,5.868,0,0,0,.372-1.942c.039-.853.048-1.125.048-3.3s-.009-2.445-.048-3.3A5.868,5.868,0,0,0,15.58,2.76a3.908,3.908,0,0,0-.923-1.417A3.908,3.908,0,0,0,13.24.42,5.868,5.868,0,0,0,11.3.048C10.445.009,10.173,0,8,0Z" fill="currentColor"></path>
                      <path d="M8,3.892A4.108,4.108,0,1,0,12.108,8,4.108,4.108,0,0,0,8,3.892Zm0,6.775A2.667,2.667,0,1,1,10.667,8,2.667,2.667,0,0,1,8,10.667Z" fill="currentColor"></path>
                      <circle cx="12.27" cy="3.73" r="0.96" fill="currentColor"></circle>
                    </svg>
                    <div className="screen-reader">Instagram</div>
                  </Link>
                </li>
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_icon-link w-inline-block">
                    <svg width="100%" height="100%" viewBox="0 0 16 16">
                      <path d="M12.3723 1.16992H14.6895L9.6272 6.95576L15.5825 14.829H10.9196L7.26734 10.0539L3.08837 14.829H0.769833L6.18442 8.64037L0.471436 1.16992H5.2528L8.55409 5.53451L12.3723 1.16992ZM11.5591 13.4421H12.843L4.55514 2.48399H3.17733L11.5591 13.4421Z" fill="currentColor"></path>
                    </svg>
                    <div className="screen-reader">X</div>
                  </Link>
                </li>
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_icon-link w-inline-block">
                    <svg width="100%" height="100%" viewBox="0 0 16 16">
                      <path d="M15.3,0H0.7C0.3,0,0,0.3,0,0.7v14.7C0,15.7,0.3,16,0.7,16h14.7c0.4,0,0.7-0.3,0.7-0.7V0.7 C16,0.3,15.7,0,15.3,0z M4.7,13.6H2.4V6h2.4V13.6z M3.6,5C2.8,5,2.2,4.3,2.2,3.6c0-0.8,0.6-1.4,1.4-1.4c0.8,0,1.4,0.6,1.4,1.4 C4.9,4.3,4.3,5,3.6,5z M13.6,13.6h-2.4V9.9c0-0.9,0-2-1.2-2c-1.2,0-1.4,1-1.4,2v3.8H6.2V6h2.3v1h0c0.3-0.6,1.1-1.2,2.2-1.2 c2.4,0,2.8,1.6,2.8,3.6V13.6z" fill="currentColor"></path>
                    </svg>
                    <div className="screen-reader">LinkedIn</div>
                  </Link>
                </li>
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_icon-link w-inline-block">
                    <svg width="100%" height="100%" viewBox="0 0 16 16">
                      <path d="M15.8,4.8c-0.2-1.3-0.8-2.2-2.2-2.4C11.4,2,8,2,8,2S4.6,2,2.4,2.4C1,2.6,0.3,3.5,0.2,4.8C0,6.1,0,8,0,8 s0,1.9,0.2,3.2c0.2,1.3,0.8,2.2,2.2,2.4C4.6,14,8,14,8,14s3.4,0,5.6-0.4c1.4-0.3,2-1.1,2.2-2.4C16,9.9,16,8,16,8S16,6.1,15.8,4.8z M6,11V5l5,3L6,11z" fill="currentColor"></path>
                    </svg>
                    <div className="screen-reader">YouTube</div>
                  </Link>
                </li>
              </ul>
              <ul role="list" className="button-group gap-xsmall margin-top_none w-list-unstyled">
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_link on-inverse w-inline-block">
                    <div>Privacy</div>
                  </Link>
                </li>
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_link on-inverse w-inline-block">
                    <div>Terms</div>
                  </Link>
                </li>
                <li className="margin-bottom_none">
                  <Link href="/404" className="footer_link on-inverse w-inline-block">
                    <div>Cookies</div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer_link-scroll-up">
            <Link href="/home" className="footer_link on-inverse w-inline-block">
              <div>↑ Back to top</div>
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
