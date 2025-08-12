export const TOOLTIPS = {
  // Control buttons
  mic: {
    start: "Start voice input",
    stop: "Stop voice input"
  },
  edit: "Edit last message",
  info: "About Winston",
  clear: "Clear input",
  
  // Mode buttons
  guide: "Guide mode",
  assistant: "Assistant mode",
  
  // Other UI elements
  close: "Close chat",
  send: "Send message",
  clearHistory: "Clear chat history"
} as const;

export type TooltipKey = keyof typeof TOOLTIPS;
export type TooltipValue = string | { start: string; stop: string };

export function getTooltip(key: TooltipKey, variant?: string): string {
  const tooltip = TOOLTIPS[key];
  
  if (typeof tooltip === 'string') {
    return tooltip;
  }
  
  if (typeof tooltip === 'object' && variant) {
    return tooltip[variant as keyof typeof tooltip] || tooltip.start;
  }
  
  return tooltip.start || '';
}
