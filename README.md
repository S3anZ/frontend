# AI Chatbot Frontend

This is the frontend application for the AI Chatbot, built with Next.js and deployed on Vercel.

## Features

- **Multi-modal Chat**: Text, voice, and image input support
- **Real-time Communication**: WebSocket-based chat interface
- **Voice Features**: Speech-to-text and text-to-speech capabilities
- **Image Analysis**: Image classification and analysis
- **User Authentication**: Supabase-based authentication system
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Authentication**: Supabase
- **UI Components**: Custom components with Framer Motion
- **Backend**: Hugging Face Spaces (ai-chatbot-backend)

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. **Run development server**
   ```bash
   npm run dev
   ```

## Deployment

This frontend is configured for deployment on Vercel:

1. **Connect to GitHub**: Push your code to a GitHub repository
2. **Deploy on Vercel**: Connect your GitHub repo to Vercel
3. **Environment Variables**: Add your environment variables in Vercel dashboard
4. **Deploy**: Vercel will automatically deploy on every push to main branch

## API Endpoints

The frontend connects to the backend hosted on Hugging Face Spaces:
- **Base URL**: `https://sean22123-backend.hf.space`
- **Endpoints**:
  - `/chat` - Chat with AI (Gemini 2.0 Flash & Qwen2.5)
  - `/tts/speak` - Text-to-speech
  - `/stt/transcribe-blob` - Speech-to-text
  - `/classify-image` - Image classification (Gemini Vision & Google ViT)
  - `/tts/voices` - Available TTS voices
  - `/tts/health` - TTS service health (optional)
  - `/stt/health` - STT service health (optional)

## Project Structure

```
frontend/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utility functions and configurations
├── pages/             # Next.js pages
├── public/            # Static assets
├── styles/            # Global styles
└── package.json       # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
