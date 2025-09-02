# Winston Chat AI

![Winston Mascot](public/winston.svg)

**Winston Chat AI** is an enterprise-grade embeddable chatbot platform that transforms static websites into dynamic, conversational experiences. Built with React, Next.js, and OpenAI, it powers intelligent user engagement, navigation assistance, and customer support for portfolios, SaaS products, e-commerce, and enterprise platforms.

---

## 🚀 Features

### Core Functionality
- **Three-Pane Layout**: Fixed header, scrollable messages, fixed composer
- **Dual Conversation Modes**:
  - **Guide Mode**: Site-specific help and information with knowledge base integration
  - **Assistant Mode**: Web search for additional resources
- **Voice Controls**: Separate microphone (STT) and speaker (TTS) buttons
- **Mobile-First Design**: Responsive layout with Tailwind CSS + Shadcn/UI
- **Accessibility**: ARIA labels, role="log", aria-live="polite", keyboard navigation

### Advanced Features
- **Multi-Site Support**: Host-based site mapping with custom greetings
- **Knowledge Base Integration**: Context-aware responses with citation support
- **CORS & Security**: Proper origin validation and CSP headers
- **HTTPS Enforcement**: Production security with automatic redirects
- **Real-time Status**: `/api/status` endpoint for health monitoring

### Widget Deployment
- **Standalone Pages**: `/winston-widget`, `/werule-widget`, `/william-widget`
- **Embeddable**: CORS-enabled for cross-origin embedding
- **Customizable**: Site-specific branding and knowledge bases

---

## 🏗️ Architecture

### Three Pillars
1. **Context-Aware Design**: Intelligent responses based on site content
2. **Seamless Integration**: One-line embed code with zero design disruption
3. **Scalable Architecture**: Multi-tenant support with host-based configuration

### Tech Stack
- **Framework**: [Next.js 14.2.32 (App Router)](https://nextjs.org/docs/app)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **AI**: [OpenAI GPT-3.5 Turbo](https://platform.openai.com/docs/models/gpt-3-5)
- **Voice**: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/WinstonAC/winston-Chat.git
cd winston-chat
npm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
cp .env.example .env.local
```

Required variables:
```env
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_PORTFOLIO_HOST=your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://*.squarespace.com
```

### 3. Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
app/
├── api/
│   ├── chat/route.ts          # Main chat API with OpenAI integration
│   ├── status/route.ts        # Health check endpoint
│   └── health/route.ts        # OpenAI connection test
├── components/
│   ├── ChatWidget.tsx         # Main chat component (three-pane layout)
│   ├── ChatLauncher.tsx       # Floating button launcher
│   └── FloatingButton.tsx     # Embeddable widget button
├── hooks/
│   ├── useSTT.ts              # Speech-to-text functionality
│   └── useTTS.ts              # Text-to-speech functionality
├── lib/
│   ├── siteConfig.ts          # Host mapping and site-specific content
│   ├── retrieval.ts           # Knowledge base chunk retrieval
│   ├── prompts.ts             # System prompts for different KBs
│   ├── sanitize.ts            # Response sanitization
│   └── intents.ts             # Help intent detection
└── pages/
    ├── winston-widget/        # Demo standalone page
    ├── werule-widget/         # WeRule widget page
    └── william-widget/        # Portfolio widget page
```

---

## 🔧 Configuration

### Site Mapping
Configure host-to-site mapping in `app/lib/siteConfig.ts`:
```typescript
const siteMapping = {
  'chat.winstonai.io': 'demo',
  'williamacampbell.com': 'portfolio', 
  'we-rule.com': 'werule'
};
```

### Knowledge Bases
- **winstonchat**: Winston Chat AI features and implementation
- **werule**: WeRule mentorship platform (natural conversation)
- **william**: Portfolio projects and experience (with citations)

### CORS & Security
Configure allowed origins in `next.config.js`:
```javascript
headers: [
  {
    key: 'Permissions-Policy',
    value: 'microphone=(self "https://your-domain.com")'
  }
]
```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Fork the repository
2. Connect to [Vercel](https://vercel.com/)
3. Set environment variables in dashboard
4. Deploy automatically on push

### Environment Variables
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_PORTFOLIO_HOST=your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://*.squarespace.com
ALLOWED_SUFFIXES=.squarespace.com,.weebly.com
```

---

## 🤖 OpenAI Compliance

Winston Chat AI follows OpenAI's usage policies and best practices:

### ✅ Security & Privacy
- **API Key Management**: Server-side only, never exposed to client
- **Input Validation**: Message format and content validation
- **CORS Protection**: Proper origin validation and headers

### ✅ Content Safety
- **System Prompts**: Professional, helpful tone focused on legitimate use cases
- **Response Filtering**: Citation requirements prevent generic responses
- **Error Handling**: Graceful handling of API failures and edge cases

### ✅ Usage Policies
- **Appropriate Use Cases**: Portfolio guidance, mentorship support, technical assistance
- **No Prohibited Content**: Tested against harmful queries - properly rejected
- **Rate Limiting**: Conservative API parameters and efficient prompt design

### ✅ Brand Guidelines
- **No "GPT" in Product Name**: Uses "Winston Chat AI" branding
- **Proper Attribution**: Uses OpenAI services appropriately
- **Original Branding**: Clean, professional design without OpenAI logo misuse

---

## 📊 API Endpoints

### Chat API
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "Hello"}],
  "mode": "guide",
  "kb": "winstonchat"
}
```

### Status Check
```bash
GET /api/status
# Returns: {"ok": true, "host": "example.com", "siteId": "demo"}
```

### Health Check
```bash
GET /api/health
# Tests OpenAI API connection
```

---

## 🎯 Use Cases

### Portfolio Websites
- Interactive project exploration
- Skills and experience showcase
- Contact and collaboration guidance

### SaaS Products
- Feature explanations and demos
- Onboarding assistance
- Customer support automation

### E-commerce
- Product recommendations
- Order assistance
- FAQ automation

### Enterprise Platforms
- Internal knowledge base
- Employee onboarding
- Process guidance

---

## 📈 Performance

- **Build Size**: ~90KB first load JS
- **API Response**: <2s average
- **Mobile Optimized**: Touch-friendly interface
- **Accessibility**: WCAG 2.1 compliant

---

## 🔄 Version History

### v1.2.0 (Current)
- ✅ WeRule conversational responses (no citations)
- ✅ Host-based site mapping
- ✅ Three-pane layout with accessibility
- ✅ Separate STT/TTS voice controls
- ✅ HTTPS enforcement and security headers
- ✅ Multi-widget support (demo, portfolio, WeRule)

### v1.1.0
- ✅ Knowledge base integration
- ✅ Citation system for portfolio
- ✅ CORS and embedding support

### v1.0.0
- ✅ Core chat functionality
- ✅ Voice input/output
- ✅ Mode switching

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/WinstonAC/winston-Chat/wiki)
- **Issues**: [GitHub Issues](https://github.com/WinstonAC/winston-Chat/issues)
- **Contact**: info@williamacampbell.com

---

**Built with ❤️ by [William Campbell](https://williamacampbell.com)**