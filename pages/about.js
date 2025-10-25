import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

export default function AboutPage() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Technologies - Qwen AI Chatbot</title>
        <meta
          content="Discover our portfolio featuring diverse projects that highlight the functionality of our conversational chatbot, including professional customizations for engaging interactions."
          name="description"
        />
        <meta property="og:type" content="website" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          href="https://fonts.gstatic.com"
          rel="preconnect"
          crossOrigin="anonymous"
        />
        <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="images/app-icon.png" rel="apple-touch-icon" />
      </Head>

      <style jsx global>{`
        /* Base Styles */
        *, *::before, *::after { box-sizing: border-box; }
        img, video, canvas { max-width: 100%; height: auto; }
        html, body { overflow-x: hidden; margin: 0; padding: 0; }
        
        body {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          min-height: 100vh;
          font-family: "Source Sans 3", sans-serif;
          color: #e0e0e0;
        }
        
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 0 20px;
        }

        /* Navigation */
        .site-nav {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(12px);
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
          font-size: 1.25rem;
          letter-spacing: 0.02em;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .site-nav_brand:hover {
          color: #b0b0b0;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        .site-nav_links {
          display: flex;
          gap: 24px;
        }
        .site-nav_link {
          font-family: "Source Sans 3", sans-serif;
          color: #b0b0b0;
          text-decoration: none;
          font-size: 1rem;
          position: relative;
          transition: color 0.3s ease;
        }
        .site-nav_link:hover {
          color: #ffffff;
        }
        .site-nav_link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffffff, #808080);
          transition: width 0.3s ease;
        }
        .site-nav_link:hover::after {
          width: 100%;
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* Hero Section */
        .hero-section {
          padding: 80px 20px 0;
          text-align: center;
          animation: fadeIn 1s ease-out;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(to right, #ffffff, #b0b0b0, #ffffff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: #b0b0b0;
          max-width: 700px;
          margin: 0 auto 0;
          line-height: 1.6;
        }

        /* Section Styles */
        .section {
          padding: 60px 20px;
          animation: fadeInUp 0.8s ease-out;
        }
        .section.is-secondary {
          background: transparent;
        }
        .section.is-inverse {
          background: rgba(20, 20, 20, 0.5);
          color: white;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Card Styles with Glassmorphism */
        .tech-card {
          background: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
          border: 0.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          height: 100%;
        }
        .tech-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.6s;
        }
        .tech-card:hover::before {
          left: 100%;
        }
        .tech-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(40, 40, 40, 0.9);
        }

        /* Grid Layouts */
        .grid_4-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin: 40px 0;
        }
        .grid_3-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
          align-items: center;
        }

        /* Image Styles */
        .image-ratio_1x1 {
          position: relative;
          padding-bottom: 100%;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border: 0.5px solid rgba(255, 255, 255, 0.08);
        }
        .image-ratio_4x3 {
          position: relative;
          padding-bottom: 75%;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border: 0.5px solid rgba(255, 255, 255, 0.08);
        }
        .image_cover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          filter: brightness(0.9);
        }
        .image-ratio_1x1:hover .image_cover,
        .image-ratio_4x3:hover .image_cover {
          transform: scale(1.05);
          filter: brightness(1);
        }

        /* Typography */
        .heading_h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .section.is-inverse .heading_h2 {
          color: white;
        }
        .subheading {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #b0b0b0;
        }
        .section.is-inverse .subheading {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Links */
        .ai-model-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid #808080;
          transition: all 0.3s ease;
          padding-bottom: 2px;
        }
        .ai-model-link:hover {
          color: #b0b0b0;
          border-bottom-color: #ffffff;
        }
        .section.is-inverse .ai-model-link {
          color: white;
          border-bottom-color: rgba(255, 255, 255, 0.5);
        }
        .section.is-inverse .ai-model-link:hover {
          border-bottom-color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        /* Carousel Card Styles */
        .card.on-inverse {
          background: rgba(40, 40, 40, 0.6);
          backdrop-filter: blur(12px);
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .card.on-inverse::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transition: left 0.6s;
        }
        .card.on-inverse:hover::before {
          left: 100%;
        }
        .card.on-inverse:hover {
          background: rgba(50, 50, 50, 0.8);
          transform: translateY(-6px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        }
        .card_body {
          padding: 8px;
        }
        .text-align_center {
          text-align: center;
        }
        .margin-bottom_xsmall {
          margin-bottom: 12px;
        }
        .margin-bottom_none {
          margin-bottom: 0;
        }

        /* Header Styles */
        .header {
          margin-bottom: 40px;
        }
        .header.is-align-center {
          text-align: center;
          max-width: 900px;
          margin: 0 auto 30px;
        }
        .header.is-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        /* Feature Badge */
        .feature-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          font-size: 0.875rem;
          color: #b0b0b0;
          margin-bottom: 20px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .feature-badge:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
        }

        /* Infinite Scroll Carousel */
        .infinite-scroll-container {
          overflow: hidden;
          padding: 40px 0;
          position: relative;
          width: 100%;
        }
        .infinite-scroll-container::before,
        .infinite-scroll-container::after {
          content: '';
          position: absolute;
          top: 0;
          width: 100px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .infinite-scroll-container::before {
          left: 0;
          background: linear-gradient(to right, #1a1a1a, transparent);
        }
        .infinite-scroll-container::after {
          right: 0;
          background: linear-gradient(to left, #1a1a1a, transparent);
        }
        .infinite-scroll-track {
          display: flex;
          gap: 24px;
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .infinite-scroll-track:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .infinite-scroll-item {
          flex: 0 0 350px;
          min-width: 350px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .heading_h2 {
            font-size: 2rem;
          }
          .grid_3-col,
          .header.is-2-col {
            grid-template-columns: 1fr;
          }
          .site-nav_links {
            gap: 16px;
          }
          .site-nav_link {
            font-size: 0.9rem;
          }
          .infinite-scroll-item {
            flex: 0 0 280px;
            min-width: 280px;
          }
        }
      `}</style>

      {/* Top Navigation */}
      <header className="site-nav" role="navigation" aria-label="Primary">
        <div className="site-nav_inner">
          <Link href="/" className="site-nav_brand">
            Qwen
          </Link>
          <nav className="site-nav_links">
            <Link href="/" className="site-nav_link">
              Meet Qwen
            </Link>
            <Link href="/home" className="site-nav_link">
              Home
            </Link>
            <Link href="/startmenu" className="site-nav_link">
              Chat
            </Link>
          </nav>
        </div>
      </header>

      {/* Main LLMs Section */}
      <div style={{ paddingTop: '24px', paddingBottom: '40px' }}>
        <div className="container">
          <h2 className="heading_h2" style={{ textAlign: 'center', marginBottom: '16px', marginTop: '0' }}>Core AI Models</h2>
          <p className="subheading" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 24px' }}>
            The AI chatbot leverages 3 different AI LLMs to converse with the user.{" "}
            <a
              href="https://aistudio.google.com/prompts/new_chat"
              className="ai-model-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gemini 2.0 Flash
            </a>
            ,{" "}
            <a
              href="https://openrouter.ai/deepseek/deepseek-r1-0528:free"
              className="ai-model-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Deepseek R1 0528
            </a>{" "}
            and locally downloadable model{" "}
            <a
              href="https://huggingface.co/Qwen/Qwen3-0.6B"
              className="ai-model-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Qwen3 0.6B
            </a>
            .
          </p>
          <div className="grid_4-col">
            <div className="tech-card">
              <div className="image-ratio_1x1">
                <img
                  width={300}
                  height={300}
                  alt="DeepSeek AI Model Interface"
                  src="imagesabout/ds.png"
                  loading="lazy"
                  className="image_cover"
                />
              </div>
            </div>
            <div className="tech-card">
              <div className="image-ratio_1x1">
                <img
                  width={300}
                  height={300}
                  alt="Gemini AI Model Interface"
                  src="imagesabout/gm.png"
                  loading="lazy"
                  className="image_cover"
                />
              </div>
            </div>
            <div className="tech-card">
              <div className="image-ratio_1x1">
                <img
                  width={300}
                  height={300}
                  alt="Qwen AI Model Interface"
                  src="imagesabout/qw.png"
                  loading="lazy"
                  className="image_cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Technologies Section */}
      <section className="section is-inverse">
        <div className="container">
          <div className="header is-2-col">
            <div>
              <h2 className="margin-bottom_none">Supporting Technologies</h2>
            </div>
            <p className="margin-bottom_none">
              The AI model is supported by other models for tasks like Image Recognition, Text-to-Speech, Speech-to-Text and Multi-Language Support. Even the profile picture generation is powered by an image generation model.
            </p>
          </div>
        </div>
        <div className="infinite-scroll-container">
          <div className="infinite-scroll-track">
            {/* First set of items */}
            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/google/vit-base-patch16-224" className="ai-model-link" target="_blank" rel="noopener noreferrer">google/vit-base-patch16-224</a>
                    </strong>
                  </div>
                  <p>The Vision Transformer (ViT) adapts transformers to image tasks.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/hexgrad/Kokoro-82M" className="ai-model-link" target="_blank" rel="noopener noreferrer">hexgrad/Kokoro-82M</a>
                    </strong>
                  </div>
                  <p>Open-weight TTS model with fast, high-quality synthesis.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/openai/whisper-large-v3-turbo" className="ai-model-link" target="_blank" rel="noopener noreferrer">openai/whisper-large-v3-turbo</a>
                    </strong>
                  </div>
                  <p>State-of-the-art ASR and speech translation from OpenAI.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/fofr/sdxl-emoji" className="ai-model-link" target="_blank" rel="noopener noreferrer">fofr/sdxl-emoji</a>
                    </strong>
                  </div>
                  <p>SDXL fine-tune based on emojis for image generation.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://nextjs.org" className="ai-model-link" target="_blank" rel="noopener noreferrer">Next.js</a>
                    </strong>
                  </div>
                  <p>React framework for production-grade web applications.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://supabase.com" className="ai-model-link" target="_blank" rel="noopener noreferrer">Supabase</a>
                    </strong>
                  </div>
                  <p>Open-source Firebase alternative with real-time database.</p>
                </div>
              </div>
            </div>

            {/* Duplicate set for infinite loop */}
            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/google/vit-base-patch16-224" className="ai-model-link" target="_blank" rel="noopener noreferrer">google/vit-base-patch16-224</a>
                    </strong>
                  </div>
                  <p>The Vision Transformer (ViT) adapts transformers to image tasks.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/hexgrad/Kokoro-82M" className="ai-model-link" target="_blank" rel="noopener noreferrer">hexgrad/Kokoro-82M</a>
                    </strong>
                  </div>
                  <p>Open-weight TTS model with fast, high-quality synthesis.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/openai/whisper-large-v3-turbo" className="ai-model-link" target="_blank" rel="noopener noreferrer">openai/whisper-large-v3-turbo</a>
                    </strong>
                  </div>
                  <p>State-of-the-art ASR and speech translation from OpenAI.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://huggingface.co/fofr/sdxl-emoji" className="ai-model-link" target="_blank" rel="noopener noreferrer">fofr/sdxl-emoji</a>
                    </strong>
                  </div>
                  <p>SDXL fine-tune based on emojis for image generation.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://nextjs.org" className="ai-model-link" target="_blank" rel="noopener noreferrer">Next.js</a>
                    </strong>
                  </div>
                  <p>React framework for production-grade web applications.</p>
                </div>
              </div>
            </div>

            <div className="infinite-scroll-item">
              <div className="card on-inverse">
                <div className="card_body text-align_center">
                  <div className="margin-bottom_xsmall">
                    <strong>
                      <a href="https://supabase.com" className="ai-model-link" target="_blank" rel="noopener noreferrer">Supabase</a>
                    </strong>
                  </div>
                  <p>Open-source Firebase alternative with real-time database.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speech to Text Demo */}
      <section className="section">
        <div className="container">
          <div className="grid_3-col">
            <div className="image-ratio_4x3">
              <video
                className="image_cover"
                src="/videosabout/speech2text.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
            <div className="header margin-bottom_none">
              <h2 className="heading_h2">openai/whisper-large-v3-turbo</h2>
              <p className="subheading">
                Whisper is a state-of-the-art model for automatic speech recognition (ASR) and speech translation. Trained on &gt;5M hours of labeled data, Whisper demonstrates a strong ability to generalise to many datasets and domains in a zero-shot setting.
                <br /><br />
                Here's a simple integration and working.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Transformer Demo */}
      <section className="section">
        <div className="container">
          <div className="grid_3-col">
            <div className="header margin-bottom_none">
              <h2 className="heading_h2">google/vit-base-patch16-224</h2>
              <p className="subheading">
                Vision Transformer (ViT) model pre-trained on ImageNet-21k (14 million images, 21,843 classes) at resolution 224x224. It was introduced in the paper "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale".
                <br /><br />
                Here's its integration with the Qwen3 0.6B model using FastAPI and Python.
              </p>
            </div>
            <div className="image-ratio_4x3">
              <video
                className="image_cover"
                src="/videosabout/imgrecwithQwen.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Text to Speech Demo */}
      <section className="section">
        <div className="container">
          <div className="grid_3-col">
            <div className="image-ratio_4x3">
              <video
                className="image_cover"
                src="/videosabout/kokorot2speech.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
            <div className="header margin-bottom_none">
              <h2 className="heading_h2">hexgrad/Kokoro-82M</h2>
              <p className="subheading">
                Kokoro is an open-weight TTS model with 82 million parameters. Despite its lightweight architecture, it delivers comparable quality to larger models while being significantly faster and more cost-efficient.
                <br /><br />
                A simple integration that can be used for text-to-speech using Python and FastAPI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qwen Demo */}
      <section className="section">
        <div className="container">
          <div className="grid_3-col">
            <div className="header margin-bottom_none">
              <h2 className="heading_h2">qwen/qwen3-0.6B</h2>
              <p className="subheading">
                Qwen3 is the latest generation of large language models in Qwen series, offering a comprehensive suite of dense and mixture-of-experts (MoE) models. Built upon extensive training, Qwen3 delivers groundbreaking advancements in reasoning, instruction-following, agent capabilities, and multilingual support.
                <br /><br />
                Here's a simple integration and working using Python and FastAPI.
              </p>
            </div>
            <div className="image-ratio_4x3">
              <video
                className="image_cover"
                src="/videosabout/Owenaboutpageintegration.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
