# API Documentation

## Overview

Winston Chat AI provides a RESTful API for chat functionality, health monitoring, and widget integration. All API endpoints are designed to be secure, performant, and easy to integrate.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://chat.winstonai.io`

## Authentication

### API Key Authentication
All API requests require authentication via API key in the request headers:

```http
Authorization: Bearer your-api-key
```

### Environment Variables
```env
API_KEY=your-secure-api-key
API_AUTH_TOKEN=your-auth-token
```

## Endpoints

### 1. Chat API

**Endpoint**: `POST /api/chat`

**Description**: Main chat endpoint that processes user messages and returns AI responses.

**Request Headers**:
```http
Content-Type: application/json
Authorization: Bearer your-api-key
```

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, can you help me with my portfolio?"
    }
  ],
  "mode": "guide",
  "kb": "winstonchat"
}
```

**Parameters**:
- `messages` (array): Array of message objects with `role` and `content`
- `mode` (string): Chat mode - "guide" or "assistant"
- `kb` (string): Knowledge base identifier - "winstonchat", "werule", "william"

**Response**:
```json
{
  "response": "I'd be happy to help you with your portfolio! I can assist with...",
  "citations": [
    {
      "title": "Portfolio Best Practices",
      "url": "https://example.com/portfolio-tips",
      "snippet": "Key insights about portfolio development..."
    }
  ],
  "mode": "guide",
  "kb": "winstonchat"
}
```

**Error Responses**:
```json
{
  "error": "Invalid API key",
  "code": "UNAUTHORIZED",
  "status": 401
}
```

### 2. Status Check

**Endpoint**: `GET /api/status`

**Description**: Returns the current status of the service and site configuration.

**Request Headers**:
```http
Authorization: Bearer your-api-key
```

**Response**:
```json
{
  "ok": true,
  "host": "chat.winstonai.io",
  "siteId": "demo",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.2.0"
}
```

### 3. Health Check

**Endpoint**: `GET /api/health`

**Description**: Tests the connection to external services (OpenAI API).

**Request Headers**:
```http
Authorization: Bearer your-api-key
```

**Response**:
```json
{
  "ok": true,
  "openai": {
    "status": "connected",
    "responseTime": "1.2s"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response**:
```json
{
  "ok": false,
  "openai": {
    "status": "disconnected",
    "error": "API key invalid"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Logging API

**Endpoint**: `POST /api/log`

**Description**: Logs application events and errors for monitoring.

**Request Headers**:
```http
Content-Type: application/json
Authorization: Bearer your-api-key
```

**Request Body**:
```json
{
  "level": "info",
  "message": "User started chat session",
  "metadata": {
    "userId": "user123",
    "siteId": "demo"
  }
}
```

## External Service Integrations

### OpenAI API

**Service**: OpenAI GPT-3.5 Turbo
**Purpose**: AI chat responses and content generation
**Configuration**: Server-side API key management
**Rate Limiting**: Built-in rate limiting to prevent abuse

**Integration Details**:
- API key stored in `OPENAI_API_KEY` environment variable
- Requests made server-side only
- Response streaming for better performance
- Error handling for API failures

### Web Speech API

**Service**: Browser-native speech recognition and synthesis
**Purpose**: Voice input (STT) and output (TTS)
**Configuration**: Client-side implementation with proper permissions

**Integration Details**:
- Microphone permissions via Permissions-Policy header
- Fallback handling for unsupported browsers
- Custom hooks for STT/TTS functionality
- Error handling for speech API failures

## Rate Limiting

### Configuration
- **Default Limit**: 60 requests per minute per IP
- **Configurable**: Via `RATE_LIMIT_MAX` environment variable
- **Headers**: Rate limit information returned in response headers

### Rate Limit Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642248600
```

## CORS Configuration

### Allowed Origins
Configured via `ALLOWED_ORIGINS` environment variable:
```env
ALLOWED_ORIGINS=https://your-domain.com,https://*.squarespace.com
```

### CORS Headers
```http
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Error Handling

### Standard Error Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing API key
- `RATE_LIMITED` (429): Rate limit exceeded
- `INVALID_REQUEST` (400): Malformed request
- `SERVICE_UNAVAILABLE` (503): External service unavailable
- `INTERNAL_ERROR` (500): Internal server error

## SDK Examples

### JavaScript/TypeScript
```typescript
class WinstonChatAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://chat.winstonai.io') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: string, mode = 'guide', kb = 'winstonchat') {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        mode,
        kb
      })
    });

    return response.json();
  }
}
```

### cURL Examples
```bash
# Send a chat message
curl -X POST https://chat.winstonai.io/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "mode": "guide",
    "kb": "winstonchat"
  }'

# Check service status
curl -X GET https://chat.winstonai.io/api/status \
  -H "Authorization: Bearer your-api-key"
```

## Testing

### Test Endpoint
**Endpoint**: `GET /api/test`

**Description**: Simple test endpoint for connectivity verification.

**Response**:
```json
{
  "message": "Winston Chat AI API is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Health Check Testing
```bash
# Test API connectivity
curl -X GET https://chat.winstonai.io/api/health

# Test with authentication
curl -X GET https://chat.winstonai.io/api/health \
  -H "Authorization: Bearer your-api-key"
```

