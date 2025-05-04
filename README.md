<<<<<<< HEAD
# Winston Chat

![Winston Mascot](public/winston.svg)

**Winston Chat** is a lightweight, modular chatbot built with Next.js and OpenAI. Designed to live inside personal portfolios or product sites, it acts as both an interactive guide and an AI assistant — helping visitors explore work, ask questions, or get product advice in real time.

---

## Live Demo

Coming soon — deployed on Vercel.

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

- [Next.js 15 (App Router)](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI SDK](https://www.npmjs.com/package/openai)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Lucide Icons](https://lucide.dev/)

---

## Getting Started

1. **Clone the repo:**

   ```bash
   git clone https://github.com/WinstonAC/winston-chat.git
   cd winston-chat
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   - Create a `.env.local` file in the root directory:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and add your OpenAI API key and base URL:
     ```
     OPENAI_API_KEY=your-openai-key
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```
   - For development, you can get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys)
   - The `NEXT_PUBLIC_BASE_URL` should be your development URL (http://localhost:3000) or production URL when deployed

4. **Run the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see Winston Chat in action.

---

## Folder Structure

- `app/api/chat/route.ts` — API route for chat (OpenAI integration)
- `components/ChatToggle.tsx` — Floating Winston button and chat window logic
- `components/ChatBox.tsx` — Chat UI, message handling, voice input, mode toggle
- `public/winston.svg` — Winston mascot SVG

---

## Customization

- **Change the mascot:** Replace `public/winston.svg` with your own SVG.
- **Edit system prompts:** Update the `guidePrompt` and `assistantPrompt` in `app/api/chat/route.ts`.
- **Add portfolio links:** Enhance the Assistant mode logic in `ChatBox.tsx` to match your project topics.

---

## Deployment

- Deploy to [Vercel](https://vercel.com/) for best results.
- Ensure your `.env.local` is set in the Vercel dashboard.

---

## License

MIT
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> cc9e0a5 (Initial commit from Create Next App)
