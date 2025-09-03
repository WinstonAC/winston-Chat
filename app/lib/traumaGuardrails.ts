// Trauma-informed guardrails with EU/German crisis resources
const TRAUMA_KEYWORDS = [
  'trauma', 'ptsd', 'abuse', 'violence', 'crisis', 'suicide',
  'self-harm', 'emergency', 'help', 'support', 'depression',
  'anxiety', 'mental health', 'crisis', 'notfall', 'hilfe',
  'gewalt', 'missbrauch', 'selbstmord', 'selbstverletzung'
];

export function detectTraumaIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return TRAUMA_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

export function getTraumaResponse(): string {
  return `Ich verstehe, dass Sie eine schwere Zeit durchmachen. Hier sind einige Ressourcen, die helfen können:

**Krisenunterstützung (Deutschland):**
• Hilfetelefon "Gewalt gegen Frauen": 08000 116 016
• Berliner Krisendienst: 030 390 63 00
• Polizei (Notfall): 110
• Feuerwehr/Rettungsdienst: 112

**Psychologische Hilfe:**
• Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222
• Nummer gegen Kummer (Kinder & Jugendliche): 116 111
• Elterntelefon: 0800 111 0 550

**Professionelle Unterstützung:**
• Psychotherapeutensuche: kvberlin.de
• Bundesweite Sucht- und Drogenhotline: 01805 31 30 31
• Weißer Ring (Opferhilfe): 116 006

Bitte wenden Sie sich an einen Psychologen, Psychiater oder Krisenberater für sofortige Unterstützung.

---

I understand you're going through a difficult time. Here are some resources that can help:

**Crisis Support (Germany/EU):**
• Hilfetelefon "Gewalt gegen Frauen": 08000 116 016
• Berlin Crisis Service: 030 390 63 00
• Police (Emergency): 110
• Fire/Rescue Service: 112

**Psychological Help:**
• Telefonseelsorge: 0800 111 0 111 or 0800 111 0 222
• Number against Sorrow (Children & Youth): 116 111
• Parent Hotline: 0800 111 0 550

**Professional Support:**
• Psychotherapist Search: kvberlin.de
• National Addiction & Drug Hotline: 01805 31 30 31
• White Ring (Victim Support): 116 006

Please reach out to a psychologist, psychiatrist, or crisis counselor for immediate support.`;
}

export function applyTraumaResponse(message: string, originalResponse: string): string {
  if (detectTraumaIntent(message)) {
    return getTraumaResponse();
  }
  return originalResponse;
}

// Configuration for different institutions
export const INSTITUTION_CONFIG = {
  'university-a': {
    kbName: 'university_a_kb',
    traumaMode: true,
    storageMode: 'persistent',
    allowedDomains: ['university-a.edu'],
    crisisResources: ['university-a-crisis-line', 'student-psychological-services']
  },
  'hospital-b': {
    kbName: 'hospital_b_kb', 
    traumaMode: true,
    storageMode: 'ephemeral', // HIPAA compliance
    allowedDomains: ['hospital-b.org'],
    crisisResources: ['hospital-b-emergency', 'psychiatric-emergency']
  },
  'berlin-university': {
    kbName: 'berlin_university_kb',
    traumaMode: true,
    storageMode: 'persistent',
    allowedDomains: ['fu-berlin.de', 'hu-berlin.de'],
    crisisResources: ['berliner-krisendienst', 'studentenwerk-berlin']
  }
};
