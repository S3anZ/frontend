import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
          background: linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%);
          min-height: 100vh;
          font-family: "Source Sans 3", sans-serif;
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
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 16px 20px;
          border-bottom: 1px solid rgba(122, 122, 122, 0.1);
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
          color: #7a7a7a;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .site-nav_links {
          display: flex;
          gap: 24px;
        }
        .site-nav_link {
          font-family: "Source Sans 3", sans-serif;
          color: #7a7a7a;
          text-decoration: none;
          font-size: 1rem;
          position: relative;
          transition: color 0.3s ease;
        }
        .site-nav_link:hover,
        .site-nav_brand:hover {
          color: #5f5f5f;
        }
        .site-nav_link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #7a7a7a;
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
          padding: 80px 20px 60px;
          text-align: center;
          animation: fadeIn 1s ease-out;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: #5f5f5f;
          margin-bottom: 20px;
          background: linear-gradient(to right, #7a7a7a, #5f5f5f, #7a7a7a);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: #7a7a7a;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Section Styles */
        .section {
          padding: 60px 20px;
          animation: fadeInUp 0.8s ease-out;
        }
        .section.is-secondary {
          background: rgba(255, 255, 255, 0.5);
        }
        .section.is-inverse {
          background: linear-gradient(135deg, #6e6e6e 0%, #8a8a8a 100%);
          color: white;
        }

        /* Card Styles with Glassmorphism */
        .tech-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(122, 122, 122, 0.2);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .tech-card:hover::before {
          left: 100%;
        }
        .tech-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: rgba(122, 122, 122, 0.4);
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
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .image-ratio_4x3 {
          position: relative;
          padding-bottom: 75%;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .image_cover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .image-ratio_1x1:hover .image_cover,
        .image-ratio_4x3:hover .image_cover {
          transform: scale(1.05);
        }

        /* Typography */
        .heading_h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #5f5f5f;
          margin-bottom: 16px;
        }
        .section.is-inverse .heading_h2 {
          color: white;
        }
        .subheading {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #7a7a7a;
        }
        .section.is-inverse .subheading {
          color: rgba(255, 255, 255, 0.9);
        }

        /* Links */
        .ai-model-link {
          color: #5f5f5f;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid #7a7a7a;
          transition: all 0.3s ease;
          padding-bottom: 2px;
        }
        .ai-model-link:hover {
          color: #4a4a4a;
          border-bottom-color: #4a4a4a;
        }
        .section.is-inverse .ai-model-link {
          color: white;
          border-bottom-color: rgba(255, 255, 255, 0.6);
        }
        .section.is-inverse .ai-model-link:hover {
          border-bottom-color: white;
        }

        /* Carousel Card Styles */
        .card.on-inverse {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          height: 100%;
        }
        .card.on-inverse:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
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
          padding: 6px 16px;
          background: rgba(122, 122, 122, 0.1);
          border: 1px solid rgba(122, 122, 122, 0.2);
          border-radius: 20px;
          font-size: 0.875rem;
          color: #7a7a7a;
          margin-bottom: 20px;
          font-weight: 600;
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <span className="feature-badge">AI-Powered Technologies</span>
          <h1 className="hero-title">Built with Intelligence</h1>
          <p className="hero-subtitle">
            Explore the cutting-edge AI models and technologies that power our conversational chatbot platform
          </p>
        </div>
      </section>

      {/* Main LLMs Section */}
      <section className="section is-secondary">
        <div className="container">
          <div className="header is-align-center">
            <h2 className="heading_h2">Core AI Models</h2>
            <p className="subheading">
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
          </div>
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
      </section>

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
        <div className="container mx-auto px-8 py-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              containScroll: "trimSnaps",
            }}
            className="w-full max-w-4xl mx-auto relative"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <div className="card on-inverse mx-2">
                  <div className="card_body text-align_center">
                    <div className="margin-bottom_xsmall">
                      <strong>
                        <a href="https://huggingface.co/google/vit-base-patch16-224" className="ai-model-link" target="_blank" rel="noopener noreferrer">google/vit-base-patch16-224</a>
                      </strong>
                    </div>
                    <p>The Vision Transformer (ViT) adapts transformers to image tasks.</p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <div className="card on-inverse mx-2">
                  <div className="card_body text-align_center">
                    <div className="margin-bottom_xsmall">
                      <strong>
                        <a href="https://huggingface.co/hexgrad/Kokoro-82M" className="ai-model-link" target="_blank" rel="noopener noreferrer">hexgrad/Kokoro-82M</a>
                      </strong>
                    </div>
                    <p>Open-weight TTS model with fast, high-quality synthesis.</p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <div className="card on-inverse mx-2">
                  <div className="card_body text-align_center">
                    <div className="margin-bottom_xsmall">
                      <strong>
                        <a href="https://huggingface.co/openai/whisper-large-v3-turbo" className="ai-model-link" target="_blank" rel="noopener noreferrer">openai/whisper-large-v3-turbo</a>
                      </strong>
                    </div>
                    <p>State-of-the-art ASR and speech translation from OpenAI.</p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <div className="card on-inverse mx-2">
                  <div className="card_body text-align_center">
                    <div className="margin-bottom_xsmall">
                      <strong>
                        <a href="https://huggingface.co/fofr/sdxl-emoji" className="ai-model-link" target="_blank" rel="noopener noreferrer">fofr/sdxl-emoji</a>
                      </strong>
                    </div>
                    <p>SDXL fine-tune based on emojis for image generation.</p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <div className="card on-inverse mx-2">
                  <div className="card_body text-align_center">
                    <div className="margin-bottom_xsmall">
                      <strong>
                        <a href="https://nextjs.org" className="ai-model-link" target="_blank" rel="noopener noreferrer">Next.js</a>
                      </strong>
                    </div>
                    <p>React framework for production-grade web applications.</p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <div className="card on-inverse mx-2">
                  <div className="card_body text-align_center">
                    <div className="margin-bottom_xsmall">
                      <strong>
                        <a href="https://supabase.com" className="ai-model-link" target="_blank" rel="noopener noreferrer">Supabase</a>
                      </strong>
                    </div>
                    <p>Open-source Firebase alternative with real-time database.</p>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
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
