// PII Redaction utility for secure logging
export function redactPII(text: string): string {
  if (!text) return text;
  
  return text
    // Email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    // Phone numbers (various formats)
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
    .replace(/\b\+?\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, '[PHONE]')
    // Credit card numbers
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
    // SSN
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    // Long alphanumeric IDs (likely sensitive)
    .replace(/\b[A-Za-z0-9]{12,}\b/g, '[ID]')
    // IP addresses
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
    // Common sensitive patterns
    .replace(/\b(?:password|passwd|pwd|secret|token|key|auth)\s*[:=]\s*\S+/gi, '[CREDENTIAL]');
}

// Check if logging should be disabled
export function shouldLog(): boolean {
  return process.env.LOG_MODE !== 'no-store';
}

// Enhanced logging with PII redaction
export function logSafely(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  if (!shouldLog()) return;
  
  const redactedMessage = redactPII(message);
  const redactedData = data ? JSON.parse(redactPII(JSON.stringify(data))) : undefined;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'winston-chat',
    message: redactedMessage,
    ...(redactedData && { metadata: redactedData })
  };
  
  console.log(JSON.stringify(logEntry));
}
