# Winston Chat

![Winston Mascot](public/winston.svg)

**Winston Chat** is a lightweight, modular chatbot built with Next.js and OpenAI. Designed to live inside personal portfolios or product sites, it acts as both an interactive guide and an AI assistant — helping visitors explore work, ask questions, or get product advice in real time.

---

## Features

- Floating chat widget with toggle visibility
- Two conversation modes:
  - **Guide Mode**: Answers portfolio questions + links to work
  - **Assistant Mode**: Product strategy and build support
- Voice-to-text input (Web Speech API)
- Tailwind CSS + Brutalist UI design
- GPT-3.5 Turbo integration via OpenAI API
- Mobile-responsive layout
- Mode switching with UI toggle
- Smart prompt injection based on selected mode
- Environment variable loading via `.env.local`

---

## Tech Stack

- [Next.js 14.1.0 (App Router)](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI SDK](https://www.npmjs.com/package/openai)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Geist Font](https://vercel.com/font)

---

## Getting Started

1. **Clone the repo:**

   ```bash
   git clone https://github.com/WinstonAC/winston-Chat.git
   cd winston-chat
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - Create a `.env.local` file in the root directory:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and add your OpenAI API key:
     ```
     OPENAI_API_KEY=your-openai-key
     ```
   - For development, you can get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys)

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see Winston Chat in action.

---

## Folder Structure

- `app/api/chat/route.ts` — API route for chat (OpenAI integration)
- `app/api/log/route.ts` — API route for logging chat interactions
- `app/components/ChatLauncher.tsx` — Floating Winston button
- `app/components/ChatBox.tsx` — Chat UI, message handling, voice input, mode toggle
- `app/hooks/useSpeechToText.ts` — Custom hook for voice-to-text functionality
- `app/layout.tsx` — Root layout with Geist font configuration
- `app/globals.css` — Global styles and Tailwind configuration

---

## Customization

- **Edit system prompts:** Update the `guidePrompt` and `assistantPrompt` in `app/api/chat/route.ts`
- **Modify UI:** Update styles in `app/globals.css` and component files
- **Configure logging:** Adjust logging behavior in `app/api/log/route.ts`

---

## Deployment

The application is deployed on [Vercel](https://vercel.com/). For your own deployment:

1. Fork the repository
2. Connect your fork to Vercel
3. Set up environment variables in the Vercel dashboard
4. Deploy!

---

## License

MIT 