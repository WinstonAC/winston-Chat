export function isHelpIntent(msg: string): boolean {
  const text = msg.toLowerCase().trim();
  
  // Greetings
  if (/^(hi|hello|hey|test)$/.test(text)) {
    return true;
  }
  
  // Help phrases
  const helpPhrases = [
    'what does this widget do',
    'how do these buttons work',
    'guide',
    'instructions',
    'help'
  ];
  
  return helpPhrases.some(phrase => text.includes(phrase));
}
