import Head from 'next/head';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  <meta charSet="utf-8" />
  <title>Technologies</title>
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
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n    /* Responsive helpers */\n    *, *::before, *::after { box-sizing: border-box; }\n    img, video, canvas { max-width: 100%; height: auto; }\n    html, body { overflow-x: hidden; }\n    .container { max-width: 1200px; margin: 0 auto; }\n    .layout-grid { gap: 16px; }\n\n    .site-nav {\n        position: sticky;\n        top: 0;\n        z-index: 40;\n        background: inherit; /* matches body background */\n        padding: 12px 20px;\n      }\n      .site-nav_inner {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        max-width: 1200px;\n        margin: 0 auto;\n      }\n      .site-nav_brand {\n        font-family: "Fjalla One", sans-serif;\n        font-size: 1.125rem;\n        letter-spacing: 0.02em;\n        color: #7a7a7a; /* gray text */\n        text-decoration: none;\n      }\n      .site-nav_links {\n        display: flex;\n        gap: 16px;\n      }\n      .site-nav_link {\n        font-family: "Source Sans 3", sans-serif;\n        color: #7a7a7a; /* gray text */\n        text-decoration: none;\n        font-size: 0.975rem;\n      }\n      .site-nav_link:hover,\n      .site-nav_brand:hover {\n        color: #5f5f5f;\n      }\n      \n      /* Animations for hero text */\n      @keyframes fadeInUp {\n        from { opacity: 0; transform: translateY(12px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n      @keyframes fadeInOpacity {\n        from { opacity: 0; }\n        to { opacity: 1; }\n      }\n      .animate-fade-title {\n        opacity: 0;\n        animation: fadeInUp 900ms ease-out 200ms forwards;\n      }\n      .animate-fade-subtitle {\n        opacity: 0.4;\n        animation: fadeInOpacity 900ms ease-out 600ms forwards;\n      }\n      \n      /* Image grid styling */\n      .grid_4-col {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n        gap: 20px;\n        margin: 40px 0;\n      }\n      \n      .image-ratio_1x1 {\n        aspect-ratio: 1;\n        overflow: hidden;\n        border-radius: 8px;\n        box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n      }\n      \n      .image_cover {\n        width: 100%;\n        height: 100%;\n        object-fit: cover;\n        transition: transform 0.3s ease;\n      }\n      \n      .image_cover:hover {\n        transform: scale(1.05);\n      }\n      \n             /* AI Model Links Styling */\n       .ai-model-link {\n         color: #7a7a7a;\n         text-decoration: none;\n         font-weight: 600;\n         transition: all 0.3s ease;\n         border-bottom: 1px solid transparent;\n       }\n       \n       .ai-model-link:hover {\n         color: #5f5f5f;\n         border-bottom-color: #7a7a7a;\n         transform: translateY(-1px);\n       }\n       \n                               /* Carousel Styling */\n          /* Carousel - clean theme */\n          .carousel {\n            position: relative;\n            width: 100%;\n            overflow: hidden;\n          }\n          .carousel_track {\n            display: flex;\n            will-change: transform;\n            transform: translate3d(0,0,0);\n            transition: transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);\n          }\n          .carousel_slide {\n            min-width: 25%;\n            flex: 0 0 25%;\n          }\n          .carousel_card {\n            margin: 0 8px;\n            background: #000000;\n            border: 1px solid rgba(255,255,255,0.08);\n            border-radius: 12px;\n            box-shadow: 0 6px 18px rgba(0,0,0,0.4);\n            transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;\n          }\n          .carousel_card:hover { box-shadow: 0 10px 26px rgba(0,0,0,0.55); transform: translateY(-2px); border-color: rgba(255,255,255,0.14); }\n          .carousel_card .card_body { padding: 16px; color: #cfcfcf; font-family: "Source Sans 3", sans-serif; }\n          .carousel_card .margin-bottom_xsmall strong { font-family: "Fjalla One", sans-serif; color: #e0e0e0; letter-spacing: 0.02em; }\n          .carousel_arrow { background: rgba(0,0,0,0.55); }\n          .carousel_arrow:hover { background: rgba(0,0,0,0.7); transform: translateY(-50%) scale(1.06); }\n          .carousel_arrow.is-left { left: 8px; }\n          .carousel_arrow.is-right { right: 8px; }\n\n          .carousel { position: relative; }\n          .carousel > .carousel_arrow {\n            position: absolute;\n            top: 50%;\n            inset-block-start: 50%;\n            transform: translateY(-50%);\n            z-index: 30;\n            width: 52px;\n            height: 52px;\n            border-radius: 50%;\n            border: 1px solid rgba(255,255,255,0.9);\n            background: #ffffff; /* opaque */\n            color: #111111; /* dark icon for contrast */\n            box-shadow: 0 6px 18px rgba(0,0,0,0.45);\n          }\n          .carousel_arrow:hover { background: #f2f2f2; transform: translateY(-50%) scale(1.06); }\n          .carousel > .carousel_arrow.is-left {\n            left: 10px;\n            inset-inline-start: 10px;\n            right: auto;\n          }\n          .carousel > .carousel_arrow.is-right {\n            right: 10px;\n            inset-inline-end: 10px;\n            left: auto;\n          }\n\n          /* removed dots CSS */\n\n          @media (max-width: 1024px) {\n            .carousel_slide { min-width: 33.3333%; flex-basis: 33.3333%; }\n          }\n          @media (max-width: 640px) {\n            .carousel_slide { min-width: 50%; flex-basis: 50%; }\n          }\n        \n        .carousel-controls {\n          display: flex;\n          justify-content: center;\n          align-items: center;\n          margin-top: 30px;\n          gap: 20px;\n        }\n        \n        .carousel-btn {\n          background: #7a7a7a;\n          color: white;\n          border: none;\n          width: 40px;\n          height: 40px;\n          border-radius: 50%;\n          font-size: 20px;\n          cursor: pointer;\n          transition: all 0.3s ease;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        }\n        \n        .carousel-btn:hover {\n          background: #5f5f5f;\n          transform: scale(1.1);\n        }\n        \n        .carousel-btn:disabled {\n          opacity: 0.5;\n          cursor: not-allowed;\n        }\n        \n        .carousel-dots {\n          display: flex;\n          gap: 8px;\n        }\n        \n        .dot {\n          width: 12px;\n          height: 12px;\n          border-radius: 50%;\n          background: #ccc;\n          cursor: pointer;\n          transition: all 0.3s ease;\n        }\n        \n        .dot.active {\n          background: #7a7a7a;\n          transform: scale(1.2);\n        }\n        \n        .dot:hover {\n          background: #999;\n        }\n        \n                 /* Responsive adjustments */\n         @media (max-width: 768px) {\n           .grid_4-col {\n             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n             gap: 16px;\n           }\n           \n           .carousel-container {\n             max-width: 100%;\n             padding: 0 10px;\n           }\n           \n           .carousel-slide {\n             padding: 0;\n           }\n           \n           .carousel-controls {\n             margin-top: 20px;\n             gap: 15px;\n           }\n           \n           .carousel-slide .card {\n             margin: 0 5px;\n           }\n         }\n    '
    }}
  />
  {/* Top Navigation */}
  <header className="site-nav" role="navigation" aria-label="Primary">
    <div className="site-nav_inner">
    <Link href="/" className="site-nav_brand" >
        Qwen
      </Link>
      <nav className="site-nav_links">
      <Link href="/" className="site-nav_link" >
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
  <div className="w-layout-grid grid_5-col tablet-1-col gap-medium is-y-bottom">
    <div
      id="w-node-a15aa3ad-b541-e3b1-545d-786b4da84a6c-4da84a69"
      className="heading-responsive_wrapper w-node-d6dc2870-7c01-8261-31e0-4caafbd61217-1177a568"
    ></div>
  </div>
  <section className="section is-secondary">
    <div className="container">
      <div className="header is-align-center">
        <h2 className="heading_h2">Working</h2>
        <p className="subheading">
          The AI chatbot leverages 3 different AI LLMs to converse with the
          user.{" "}
          <a
            href="https://aistudio.google.com/prompts/new_chat"
            className="ai-model-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini
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
            Qwen3 0.6M
          </a>
          .
        </p>
      </div>
      <div className="w-layout-grid grid_4-col gap-xsmall">
        <div className="image-ratio_1x1">
          <img
            width={300}
            height={300}
            alt="[interface] image of a computer showcasing educational software (for a edtech)"
            src="imagesabout/ds.png"
            loading="lazy"
            className="image_cover"
          />
        </div>
        <div className="image-ratio_1x1">
          <img
            width={300}
            height={300}
            alt="[digital project] image of a social media ad design (for a social media and communication)"
            src="imagesabout/gm.png"
            loading="lazy"
            className="image_cover"
          />
        </div>
        <div className="image-ratio_1x1">
          <img
            width={300}
            height={300}
            alt="interface image of employee interacting with hr software"
            src="imagesabout/qw.png"
            loading="lazy"
            className="image_cover"
          />
        </div>
      </div>
    </div>
  </section>
  <section className="section is-inverse">
    <div className="container">
      <div className="w-layout-grid header is-2-col">
        <div
          id="w-node-_86c6bb2f-c595-1d46-2294-c5e7caf3db38-caf3db34"
          className="w-node-c0f79da4-7573-5c1e-35aa-2a08b6c68f7b-1177a568"
        >
          <h2 className="margin-bottom_none">Other Technologies Integrated</h2>
        </div>
        <p
          id="w-node-_86c6bb2f-c595-1d46-2294-c5e7caf3db3f-caf3db34"
          className="margin-bottom_none w-node-c0f79da4-7573-5c1e-35aa-2a08b6c68f7d-1177a568"
        >
          The AI model is supported by other models for tasks like Image
          Recognition, Text-to-Speech, Speech-to-Text and Multi-Language
          Support. Even the profile picture generation is powered by an image
          generation model. Yes, had a lot of fun with AIs.
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
                    <a href="https://webflow.com" className="ai-model-link" target="_blank" rel="noopener noreferrer">Webflow CSS</a>
                  </strong>
                </div>
                <p>Visual builder that outputs clean, semantic HTML/CSS.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://cursor.com/home" className="ai-model-link" target="_blank" rel="noopener noreferrer">Cursor</a>
                  </strong>
                </div>
                <p>AI-first code editor deeply integrating AI workflows.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://huggingface.co/Qwen/Qwen3-0.6B" className="ai-model-link" target="_blank" rel="noopener noreferrer">Qwen3 0.6B</a>
                  </strong>
                </div>
                <p>Small, local-friendly LLM used in this project.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://openrouter.ai/deepseek/deepseek-r1-0528:free" className="ai-model-link" target="_blank" rel="noopener noreferrer">DeepSeek R1 0528</a>
                  </strong>
                </div>
                <p>Reasoning-focused model accessed via OpenRouter.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://aistudio.google.com/prompts/new_chat" className="ai-model-link" target="_blank" rel="noopener noreferrer">Gemini</a>
                  </strong>
                </div>
                <p>Google's LLM used for conversations.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://huggingface.co/microsoft/DialoGPT-medium" className="ai-model-link" target="_blank" rel="noopener noreferrer">DialoGPT-medium</a>
                  </strong>
                </div>
                <p>Microsoft's conversational AI model for dialogue generation.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://huggingface.co/facebook/blenderbot-400M-distill" className="ai-model-link" target="_blank" rel="noopener noreferrer">BlenderBot-400M</a>
                  </strong>
                </div>
                <p>Facebook's open-domain chatbot for engaging conversations.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" className="ai-model-link" target="_blank" rel="noopener noreferrer">Stable Diffusion XL</a>
                  </strong>
                </div>
                <p>Advanced text-to-image generation with high-quality outputs.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2" className="ai-model-link" target="_blank" rel="noopener noreferrer">MiniLM-L6-v2</a>
                  </strong>
                </div>
                <p>Efficient sentence embeddings for semantic similarity tasks.</p>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
            <div className="card on-inverse mx-2">
              <div className="card_body text-align_center">
                <div className="margin-bottom_xsmall">
                  <strong>
                    <a href="https://huggingface.co/microsoft/codebert-base" className="ai-model-link" target="_blank" rel="noopener noreferrer">CodeBERT</a>
                  </strong>
                </div>
                <p>Pre-trained model for programming language understanding.</p>
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
  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
        <div
          id="w-node-_36c9f788-3392-7364-fed6-9077607bc20a-9459a45b"
          className="image-ratio_4x3 w-node-b46af21a-c35b-47f8-c983-81552d26aeae-1177a568"
        >
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
        <div
          id="w-node-ea4306bc-a9f2-818b-8dba-448f9459a45e-9459a45b"
          className="header margin-bottom_none w-node-b46af21a-c35b-47f8-c983-81552d26aeac-1177a568"
        >
          <h2 className="heading_h2">openai/whisper-large-v3-turbo</h2>
          <p className="subheading">
            Whisper is a state-of-the-art model for automatic speech recognition
            (ASR) and speech translation, proposed in the paper Robust Speech
            Recognition via Large-Scale Weak Supervision by Alec Radford et al.
            from OpenAI. Trained on &gt;5M hours of labeled data, Whisper
            demonstrates a strong ability to generalise to many datasets and
            domains in a zero-shot setting.
            <br />
            <br />
            Heres a simple integration and working.
          </p>
        </div>
      </div>
    </div>
  </section>
  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
        <div
          id="w-node-ea4306bc-a9f2-818b-8dba-448f9459a45e-9459a45b"
          className="header margin-bottom_none w-node-b46af21a-c35b-47f8-c983-81552d26aeac-1177a568"
        >
          <h2 className="heading_h2">google/vit-base-patch16-224</h2>
          <p className="subheading">
            Vision Transformer (base-sized model).Vision Transformer (ViT) model
            pre-trained on ImageNet-21k (14 million images, 21,843 classes) at
            resolution 224x224, and fine-tuned on ImageNet 2012 (1 million
            images, 1,000 classes) at resolution 224x224. It was introduced in
            the paper An Image is Worth 16x16 Words: Transformers for Image
            Recognition at Scale by Dosovitskiy et al.
            <br />
            <br />
            Heres its integration with the Qwen3 0.6B model using fast-api and
            python. A simple integration that can be used for image recognition.
          </p>
        </div>
        <div
          id="w-node-_36c9f788-3392-7364-fed6-9077607bc20a-9459a45b"
          className="image-ratio_4x3 w-node-b46af21a-c35b-47f8-c983-81552d26aeae-1177a568"
        >
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
  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
        <div
          id="w-node-_36c9f788-3392-7364-fed6-9077607bc20a-9459a45b"
          className="image-ratio_4x3 w-node-b46af21a-c35b-47f8-c983-81552d26aeae-1177a568"
        >
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
        <div
          id="w-node-ea4306bc-a9f2-818b-8dba-448f9459a45e-9459a45b"
          className="header margin-bottom_none w-node-b46af21a-c35b-47f8-c983-81552d26aeac-1177a568"
        >
          <h2 className="heading_h2">hexgrad/Kokoro-82M</h2>
          <p className="subheading">
            Kokoro is an open-weight TTS model with 82 million parameters.
            Despite its lightweight architecture, it delivers comparable quality
            to larger models while being significantly faster and more
            cost-efficient. With Apache-licensed weights, Kokoro can be deployed
            anywhere from production environments to personal projects.
            <br />
            <br />A simple integration that can be used for text-to-speech using
            Python and fast-api. It provides multiple languages and voices.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
        <div
          id="w-node-ea4306bc-a9f2-818b-8dba-448f9459a45e-9459a45b"
          className="header margin-bottom_none w-node-b46af21a-c35b-47f8-c983-81552d26aeac-1177a568"
        >
          <h2 className="heading_h2">qwen/qwen3-0.6B</h2>
          <p className="subheading">
          Qwen3 is the latest generation of large language models in Qwen series, 
          offering a comprehensive suite of dense and mixture-of-experts (MoE) models. 
          Built upon extensive training, Qwen3 delivers groundbreaking advancements in reasoning, 
          instruction-following, agent capabilities, and multilingual support
            <br />
            <br />
            Heres a simple integration and working using Python and FastAPI
          </p>
        </div>
        <div
          id="w-node-_36c9f788-3392-7364-fed6-9077607bc20a-9459a45b"
          className="image-ratio_4x3 w-node-b46af21a-c35b-47f8-c983-81552d26aeae-1177a568"
        >
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
