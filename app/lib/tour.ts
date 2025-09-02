export type TourStepId = 'guide' | 'assistant' | 'mic' | 'speaker' | 'pen' | 'clear' | 'done';

export const TOUR_STEPS: { id: TourStepId; title: string; body: string; ctas?: string[] }[] = [
  { 
    id: 'guide', 
    title: 'Guide tab', 
    body: 'Site-specific help based on this page\'s knowledge base. Ask about the project you\'re viewing.', 
    ctas: ['Next', 'Skip'] 
  },
  { 
    id: 'assistant', 
    title: 'Assistant tab', 
    body: 'General Q&A; may use the web if enabled. Good for broader questions.', 
    ctas: ['Next', 'Back', 'Skip'] 
  },
  { 
    id: 'mic', 
    title: 'Mic (🎤)', 
    body: 'Speak and I\'ll transcribe into the input. Requires HTTPS, Chrome/Edge.', 
    ctas: ['Next', 'Try mic', 'Skip'] 
  },
  { 
    id: 'speaker', 
    title: 'Speaker (🔊)', 
    body: 'I can read the last answer aloud. Click again to stop.', 
    ctas: ['Next', 'Play last reply', 'Back'] 
  },
  { 
    id: 'pen', 
    title: 'Pen (✎)', 
    body: 'Open long-form input/paste to send bigger messages.', 
    ctas: ['Next', 'Open pen', 'Back'] 
  },
  { 
    id: 'clear', 
    title: 'Clear History', 
    body: 'Clears this conversation locally (does not affect the knowledge base).', 
    ctas: ['Done', 'Back'] 
  },
  { 
    id: 'done', 
    title: 'That\'s it!', 
    body: 'Want to ask something now, or restart the tour?', 
    ctas: ['Ask something', 'Restart tour'] 
  },
];

export const TOUR_INTRO = `Want a 60-second tour of this widget?
I'll show: Guide, Assistant, Mic (🎤), Speaker (🔊), Pen (✎), and Clear History.
Pick one to start, or type your question.`;

export function getConnectedLine(kb: string): string {
  switch (kb.toLowerCase()) {
    case 'william':
      return `Connected data: William's Portfolio`;
    case 'werule':
      return `Connected data: WeRule Mentorship Platform`;
    case 'winstonchat':
      return `Connected data: Winston Chat AI Case Study`;
    default:
      return `Connected data: Winston Chat AI Case Study`;
  }
}
