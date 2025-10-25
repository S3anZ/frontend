import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Dynamically import the Spline wrapper component with SSR disabled
const DynamicSpline = dynamic(
  () => import('../components/SplineWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '600px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000000'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: '#fff'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Loading 3D scene...</div>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    // Hide overlay after page loads
    let hidden = false;
    function hideOverlay() {
      if (hidden) return;
      hidden = true;
      setOverlayVisible(false);
    }
    
    // Hide when page finishes loading (includes Spline async scripts)
    window.addEventListener('load', hideOverlay);
    // Fallback timeout
    setTimeout(hideOverlay, 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener('load', hideOverlay);
    };
  }, []);

  return (
    <>
  <meta charSet="utf-8" />
  <title>About Qwen</title>
  <meta
    content="Discover our portfolio featuring diverse projects that highlight the functionality of our conversational chatbot, including professional customizations for engaging interactions."
    name="description"
  />
  <meta
    content="Portfolio of Conversational Chatbot Projects"
    property="og:title"
  />
  <meta
    content="Discover our portfolio featuring diverse projects that highlight the functionality of our conversational chatbot, including professional customizations for engaging interactions."
    property="og:description"
  />
  <meta
    content="Portfolio of Conversational Chatbot Projects"
    property="twitter:title"
  />
  <meta
    content="Discover our portfolio featuring diverse projects that highlight the functionality of our conversational chatbot, including professional customizations for engaging interactions."
    property="twitter:description"
  />
  <meta property="og:type" content="website" />
  <meta content="summary_large_image" name="twitter:card" />
  <meta content="width=device-width, initial-scale=1" name="viewport" />
  <meta content="Next.js" name="generator" />
  <link
    href="css/conversational-chatbot.webflow.shared.c3f87610b.css"
    rel="stylesheet"
    type="text/css"
  />
  <link href="https://fonts.googleapis.com" rel="preconnect" />
  <link
    href="https://fonts.gstatic.com"
    rel="preconnect"
    crossOrigin="anonymous"
  />
  <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" />
  <link href="images/app-icon.png" rel="apple-touch-icon" />
  {/* css links to spline integration. dont touch this */}
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n      .loading-overlay {\n        position: fixed;\n        inset: 0;\n        background: rgba(10, 10, 10, 0.9);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        z-index: 9999;\n        transition: opacity 0.3s ease;\n      }\n      .loading-content {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 12px;\n        color: #fff;\n        font-family: "Source Sans 3", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;\n      }\n      .loading-spinner {\n        width: 48px;\n        height: 48px;\n        border: 4px solid rgba(255,255,255,0.2);\n        border-top-color: #fff;\n        border-radius: 50%;\n        animation: spin 1s linear infinite;\n      }\n      @keyframes spin {\n        to { transform: rotate(360deg); }\n      }\n      .loading-text {\n        font-size: 16px;\n        opacity: 0.9;\n      }\n    '
    }}
  />
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n      /* Responsive helpers */\n      *, *::before, *::after { box-sizing: border-box; }\n      img, video, canvas { max-width: 100%; height: auto; }\n      html, body { overflow-x: hidden; }\n      .container { max-width: 1200px; margin: 0 auto; }\n      .layout-grid { gap: 16px; }\n      \n             /* Hero Section with Spline Integration */\n       .hero-spline-section {\n         position: relative;\n         width: 100%;\n         height: 100vh;\n         min-height: 600px;\n         display: flex;\n         flex-direction: column;\n         align-items: center;\n         justify-content: center;\n         overflow: hidden;\n         background: #000000;\n       }\n       \n       .hero-content {\n         position: absolute;\n         top: 20%;\n         left: 50%;\n         transform: translate(-50%, -50%);\n         z-index: 30;\n         text-align: center;\n         color: #ffffff;\n         width: 100%;\n         padding: 0 20px;\n       }\n      \n      .hero-title {\n        font-family: "Fjalla One", sans-serif;\n        font-size: clamp(2.5rem, 8vw, 4rem);\n        font-weight: bold;\n        margin: 0 0 1rem 0;\n        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);\n        letter-spacing: 0.05em;\n      }\n      \n      .hero-subtitle {\n        font-family: "Source Sans 3", sans-serif;\n        font-size: clamp(1rem, 3vw, 1.25rem);\n        margin: 0;\n        opacity: 0.9;\n        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\n      }\n      \n             /* Spline Container */\n       .spline-container {\n         position: absolute;\n         top: 45%;\n         left: 0;\n         width: 100%;\n         height: 100%;\n         z-index: 10;\n         background: #000000;\n       }\n       \n       .spline-scene {\n         position: sticky;\n         width: 100%;\n         height: 100%;\n         overflow: hidden;\n         background: #000000;\n       }\n       \n       .spline-canvas {\n         width: 100% !important;\n         height: 100% !important;\n         display: block;\n         object-fit: cover;\n         background: #000000;\n       }\n      \n      @media (max-width: 991px) {\n        .layout-grid.grid_5-col,\n        .layout-grid.grid_4-col,\n        .layout-grid.grid_3-col,\n        .layout-grid.grid_2-col {\n          grid-template-columns: 1fr 1fr !important;\n        }\n        \n        .hero-spline-section {\n          height: 80vh;\n          min-height: 500px;\n        }\n        \n        .hero-title {\n          font-size: clamp(2rem, 6vw, 3rem);\n        }\n        \n        .hero-subtitle {\n          font-size: clamp(0.9rem, 2.5vw, 1.1rem);\n        }\n      }\n      \n      @media (max-width: 767px) {\n        .layout-grid.grid_5-col,\n        .layout-grid.grid_4-col,\n        .layout-grid.grid_3-col,\n        .layout-grid.grid_2-col {\n          grid-template-columns: 1fr !important;\n        }\n        \n        .hero-spline-section {\n          height: 70vh;\n          min-height: 400px;\n        }\n        \n        .hero-title {\n          font-size: clamp(1.8rem, 5vw, 2.5rem);\n        }\n        \n        .hero-subtitle {\n          font-size: clamp(0.8rem, 2vw, 1rem);\n        }\n        \n                 .hero-content {\n           padding: 0 20px;\n           width: 100%;\n           max-width: 90%;\n         }\n      }\n      \n      @media (max-width: 480px) {\n        .hero-spline-section {\n          height: 60vh;\n          min-height: 350px;\n        }\n        \n        .hero-title {\n          font-size: clamp(1.5rem, 4.5vw, 2rem);\n        }\n        \n        .hero-subtitle {\n          font-size: clamp(0.7rem, 1.8vw, 0.9rem);\n        }\n        \n                 .hero-content {\n           padding: 0 15px;\n           width: 100%;\n           max-width: 95%;\n         }\n      }\n      \n      /* Landscape orientation fixes */\n      @media (max-height: 500px) and (orientation: landscape) {\n        .hero-spline-section {\n          height: 100vh;\n          min-height: 300px;\n        }\n        \n        .hero-title {\n          font-size: clamp(1.2rem, 4vw, 1.8rem);\n        }\n        \n        .hero-subtitle {\n          font-size: clamp(0.6rem, 1.5vw, 0.8rem);\n        }\n      }\n      \n      /* Simple top navigation */\n      .site-nav {\n        position: sticky;\n        top: 0;\n        z-index: 40;\n        background: inherit; /* matches body background */\n        padding: 12px 20px;\n      }\n      .site-nav_inner {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        max-width: 1200px;\n        margin: 0 auto;\n      }\n      .site-nav_brand {\n        font-family: "Fjalla One", sans-serif;\n        font-size: 1.125rem;\n        letter-spacing: 0.02em;\n        color: #7a7a7a; /* gray text */\n        text-decoration: none;\n      }\n      .site-nav_links {\n        display: flex;\n        gap: 16px;\n      }\n      .site-nav_link {\n        font-family: "Source Sans 3", sans-serif;\n        color: #7a7a7a; /* gray text */\n        text-decoration: none;\n        font-size: 0.975rem;\n      }\n      .site-nav_link:hover,\n      .site-nav_brand:hover {\n        color: #5f5f5f;\n      }\n      \n      /* Animations for hero text */\n      @keyframes fadeInUp {\n        from { opacity: 0; transform: translateY(12px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n      @keyframes fadeInOpacity {\n        from { opacity: 0; }\n        to { opacity: 1; }\n      }\n      .animate-fade-title {\n        opacity: 0;\n        animation: fadeInUp 900ms ease-out 200ms forwards;\n      }\n      .animate-fade-subtitle {\n        opacity: 0.4;\n        animation: fadeInOpacity 900ms ease-out 600ms forwards;\n      }\n    '
    }}
  />
  {overlayVisible && (
    <div className="loading-overlay" aria-live="polite" aria-busy="true">
      <div className="loading-content">
        <div className="loading-spinner" />
        <div className="loading-text">Loading experience…</div>
      </div>
    </div>
  )}
  {/* Top Navigation */}
  <header className="site-nav" role="navigation" aria-label="Primary">
    <div className="site-nav_inner">
      <Link href="/" className="site-nav_brand">
        Qwen
      </Link>
      <nav className="site-nav_links">
        <Link href="/home" className="site-nav_link">
          Home
        </Link>
        <Link href="/startmenu" className="site-nav_link">
          Chat
        </Link>
        <Link href="/about" className="site-nav_link">
          Working
        </Link>
      </nav>
    </div>
  </header>
  {/* Hero Section with Spline Integration */}
  <section className="hero-spline-section">
    <div className="hero-content">
      <h1 className="hero-title animate-fade-title">Meet, Qwen</h1>
      <p className="hero-subtitle animate-fade-subtitle">
        Your AI companion for meaningful conversations
      </p>
    </div>
    {/* Responsive Spline Container */}
    <div className="spline-container">
      <div className="spline-scene" style={{ minHeight: '600px', minWidth: '100%', height: '100%' }}>
        <DynamicSpline sceneUrl="https://prod.spline.design/Dx4zlx6gInBqv1CI/scene.splinecode" />
      </div>
    </div>
  </section>
  <div className="w-layout-grid grid_5-col tablet-1-col gap-medium is-y-bottom">
    <div
      id="w-node-a15aa3ad-b541-e3b1-545d-786b4da84a6c-4da84a69"
      className="heading-responsive_wrapper w-node-d6dc2870-7c01-8261-31e0-4caafbd61217-1177a568"
    ></div>
  </div>
  <section className="section is-secondary">
    <div className="container">
      <div className="header is-align-center">
        <h2 className="heading_h2">Showcase your story visually</h2>
        <p className="subheading">
          A curated gallery of moments, memories, and creative journeys. Each
          image a window into connection and possibility.
        </p>
      </div>
      <div className="w-layout-grid grid_4-col gap-xsmall">
        <div
          id="w-node-_71d66c79-281a-3b8f-01a2-27ef440c8a3b-440c8a33"
          className="image-ratio_1x1 w-node-b8d7d59d-c21b-04a3-1940-06ed0908d99b-1177a568"
        >
          <img
            width="736"
            height="736"
            alt="interface image of employee interacting with hr software"
            src="images/4d3a97d3-c8da-4b42-a5dc-5634adf9e225.avif"
            loading="lazy"
            className="image_cover"
          />
        </div>
        <div className="image-ratio_1x1">
          <img
            width="736"
            height="736"
            alt="[interface] image of a computer showcasing educational software (for a edtech)"
            src="images/cb347a23-e31e-43df-ab68-8d8dcc6e18e0.avif"
            loading="lazy"
            className="image_cover"
          />
        </div>
        <div className="image-ratio_1x1">
          <img
            width="736"
            height="736"
            alt="[digital project] image of a social media ad design (for a social media and communication)"
            src="images/2a3770fe-a098-446e-8416-e8def91c1ccc.avif"
            loading="lazy"
            className="image_cover"
          />
        </div>
        <div className="image-ratio_1x1">
          <img
            width="736"
            height="736"
            alt="interface image of employee interacting with hr software"
            src="images/34ec3cb6-6b50-4cc9-ab16-1a1d3ee7371a.avif"
            loading="lazy"
            className="image_cover"
          />
        </div>
        <div className="image-ratio_1x1">
          <img
            width="736"
            height="736"
            alt="image of networking event (for a hr tech)"
            src="images/dbbf35fe-01f0-4ec9-9c3d-7285402f6392.avif"
            loading="lazy"
            className="image_cover"
          />
        </div>
      </div>
    </div>
    <div
      id="w-node-_286694ff-5466-72c9-83da-b31e3401911d-4da84a69"
      className="header w-node-_507c3d36-887d-486f-802d-5817850d27fd-1177a568"
    >
      <div className="w-layout-grid grid_5-col tablet-1-col gap-medium is-y-bottom"></div>
    </div>
  </section>
  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
        <div
          id="w-node-ea4306bc-a9f2-818b-8dba-448f9459a45e-9459a45b"
          className="header margin-bottom_none w-node-b46af21a-c35b-47f8-c983-81552d26aeac-1177a568"
        >
          <h2 className="heading_h2">Showcasing conversations that connect</h2>
          <p className="subheading">
            Explore how personalized chatbots create meaningful, supportive
            interactions tailored for every moment you need a friend or expert.
          </p>
          <div className="button-group">
            <Link href="/about" className="button">
              View work
            </Link>
            <Link href="/login" className="button is-secondary">
              Chat now
            </Link>
          </div>
        </div>
        <div
          id="w-node-_36c9f788-3392-7364-fed6-9077607bc20a-9459a45b"
          className="image-ratio_4x3 w-node-b46af21a-c35b-47f8-c983-81552d26aeae-1177a568"
        >
          <img
            width="736"
            height="552"
            alt="interface image of employee interacting with hr software"
            src="images/4d3a97d3-c8da-4b42-a5dc-5634adf9e225.avif"
            loading="lazy"
            className="image_cover"
          />
        </div>
      </div>
    </div>
  </section>
</>

  );
}
