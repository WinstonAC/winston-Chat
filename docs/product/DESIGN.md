# Design System Documentation

## Overview

Winston Chat AI follows a mobile-first design philosophy with accessibility-first principles. The design system emphasizes clean, professional aesthetics while maintaining excellent usability across all devices and user capabilities.

## Design Philosophy

### Core Principles

1. **Mobile-First**: Designed for mobile devices first, enhanced for desktop
2. **Accessibility-First**: WCAG 2.1 AA compliance built-in
3. **Minimalist**: Clean, uncluttered interface
4. **Professional**: Enterprise-grade visual design
5. **Consistent**: Unified design language across all components

### Design Goals

- **Usability**: Intuitive user experience
- **Accessibility**: Inclusive design for all users
- **Performance**: Fast, responsive interface
- **Scalability**: Consistent across different sites
- **Branding**: Professional, trustworthy appearance

## Visual Design

### Color Palette

**Primary Colors**:
```css
:root {
  /* Light Theme */
  --background: 0 0% 100%;           /* White */
  --foreground: 220 14% 9%;          /* Dark gray */
  --muted: 220 14% 96%;              /* Light gray */
  --muted-foreground: 220 14% 45%;   /* Medium gray */
  --border: 220 14% 90%;             /* Light border */
  --input: 220 14% 96%;              /* Input background */
  --ring: 220 14% 9%;                /* Focus ring */
  
  /* Dark Theme (Future) */
  --dark-background: 220 14% 9%;
  --dark-foreground: 220 14% 96%;
  --dark-muted: 220 14% 15%;
  --dark-muted-foreground: 220 14% 65%;
  --dark-border: 220 14% 20%;
  --dark-input: 220 14% 15%;
  --dark-ring: 220 14% 96%;
}
```

**Semantic Colors**:
```css
:root {
  --success: 142 76% 36%;            /* Green */
  --warning: 38 92% 50%;             /* Orange */
  --error: 0 84% 60%;                /* Red */
  --info: 217 91% 60%;               /* Blue */
}
```

### Typography

**Font Stack**:
```css
font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Type Scale**:
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 600; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; font-weight: 600; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; }

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; font-weight: 400; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; font-weight: 400; }
.text-xs { font-size: 0.75rem; line-height: 1rem; font-weight: 400; }
```

**Responsive Typography**:
```css
/* Mobile-first responsive text */
.text-responsive {
  font-size: 1rem;
  line-height: 1.5rem;
}

@media (min-width: 640px) {
  .text-responsive {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
}
```

### Spacing System

**Spacing Scale**:
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

**Component Spacing**:
```css
/* Chat Widget */
.chat-widget {
  padding: var(--space-4);
  gap: var(--space-4);
}

/* Messages */
.message {
  margin-bottom: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

/* Buttons */
.button {
  padding: var(--space-2) var(--space-4);
  margin: var(--space-1);
}
```

## Component Design

### Chat Widget Layout

**Three-Pane Structure**:
```css
.chat-widget {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 600px;
}

.chat-header {
  flex-shrink: 0;
  padding: var(--space-4);
  border-bottom: 1px solid hsl(var(--border));
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.chat-composer {
  flex-shrink: 0;
  padding: var(--space-4);
  border-top: 1px solid hsl(var(--border));
}
```

**Responsive Breakpoints**:
```css
/* Mobile (default) */
.chat-widget {
  width: 100%;
  height: 100vh;
}

/* Tablet */
@media (min-width: 768px) {
  .chat-widget {
    width: 400px;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .chat-widget {
    width: 450px;
    height: 650px;
  }
}
```

### Button Design

**Primary Button**:
```css
.btn-primary {
  background-color: hsl(var(--foreground));
  color: hsl(var(--background));
  border: 1px solid hsl(var(--foreground));
  padding: var(--space-2) var(--space-4);
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.btn-primary:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

**Secondary Button**:
```css
.btn-secondary {
  background-color: transparent;
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  padding: var(--space-2) var(--space-4);
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: hsl(var(--muted));
}
```

**Icon Button**:
```css
.btn-icon {
  background-color: transparent;
  color: hsl(var(--muted-foreground));
  border: none;
  padding: var(--space-2);
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
}

.btn-icon:hover {
  background-color: hsl(var(--muted));
  color: hsl(var(--foreground));
}
```

### Input Design

**Text Input**:
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background-color: hsl(var(--input));
  color: hsl(var(--foreground));
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}

.input::placeholder {
  color: hsl(var(--muted-foreground));
}
```

**Textarea**:
```css
.textarea {
  resize: vertical;
  min-height: 80px;
  max-height: 200px;
}
```

### Message Design

**Message Container**:
```css
.message {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: 12px;
  max-width: 85%;
}

.message-user {
  align-self: flex-end;
  background-color: hsl(var(--foreground));
  color: hsl(var(--background));
  margin-left: auto;
}

.message-assistant {
  align-self: flex-start;
  background-color: hsl(var(--muted));
  color: hsl(var(--foreground));
  margin-right: auto;
}
```

**Message Content**:
```css
.message-content {
  line-height: 1.6;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  margin-top: var(--space-1);
  opacity: 0.7;
}
```

## Accessibility Design

### Color Contrast

**WCAG 2.1 AA Compliance**:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Contrast Examples**:
```css
/* High contrast combinations */
.text-high-contrast {
  color: hsl(220 14% 9%);    /* Dark text */
  background: hsl(0 0% 100%); /* White background */
  /* Contrast ratio: 16.5:1 */
}

.text-medium-contrast {
  color: hsl(220 14% 45%);   /* Medium gray text */
  background: hsl(220 14% 96%); /* Light background */
  /* Contrast ratio: 4.5:1 */
}
```

### Focus Management

**Focus Indicators**:
```css
.focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 4px;
}

.focus-visible:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

**Focus Order**:
- Logical tab order
- Skip links for navigation
- Focus trapping in modals
- Focus restoration

### Screen Reader Support

**ARIA Labels**:
```html
<button 
  aria-label="Send message"
  aria-describedby="send-button-help"
  class="btn-icon"
>
  <SendIcon />
</button>

<div id="send-button-help" class="sr-only">
  Press Enter to send or click to send message
</div>
```

**Semantic HTML**:
```html
<div role="log" aria-live="polite" aria-label="Chat messages">
  <div class="message" role="article">
    <div class="message-content">Hello, how can I help you?</div>
    <div class="message-time">2:30 PM</div>
  </div>
</div>
```

## Responsive Design

### Mobile-First Approach

**Base Styles (Mobile)**:
```css
/* Mobile-first base styles */
.chat-widget {
  width: 100%;
  height: 100vh;
  padding: var(--space-4);
}

.message {
  max-width: 90%;
  font-size: 1rem;
}

.button {
  min-height: 44px;
  min-width: 44px;
}
```

**Progressive Enhancement**:
```css
/* Tablet enhancements */
@media (min-width: 768px) {
  .chat-widget {
    width: 400px;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .message {
    max-width: 85%;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  .chat-widget {
    width: 450px;
    height: 650px;
  }
  
  .message {
    max-width: 80%;
  }
}
```

### Touch-Friendly Design

**Touch Targets**:
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Touch-friendly button sizes
- Gesture support

**Touch Interactions**:
```css
.touch-friendly {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-2);
  margin: var(--space-1);
}

.touch-friendly:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}
```

## Animation & Transitions

### Micro-Interactions

**Button Hover**:
```css
.button {
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

**Message Animation**:
```css
.message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Loading States**:
```css
.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Performance Considerations

**Hardware Acceleration**:
```css
.animated-element {
  transform: translateZ(0);
  will-change: transform;
}
```

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

## Brand Guidelines

### Logo Usage

**Winston Mascot**:
- Use the official Winston mascot SVG
- Maintain aspect ratio
- Minimum size: 24px
- Maximum size: 64px
- Use on light backgrounds

**Logo Placement**:
- Top-left of chat widget
- Consistent positioning
- Proper spacing from other elements

### Color Usage

**Primary Brand Colors**:
- Use the defined color palette
- Maintain consistency across all components
- Ensure proper contrast ratios
- Test in different lighting conditions

**Accent Colors**:
- Use sparingly for emphasis
- Maintain brand consistency
- Ensure accessibility compliance

### Typography Guidelines

**Font Usage**:
- Use Geist font family
- Maintain consistent sizing
- Ensure readability
- Test across different devices

**Text Hierarchy**:
- Clear heading structure
- Consistent body text
- Proper emphasis usage
- Readable line heights

## Design Tokens

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: 220 14% 9%;
  --color-secondary: 220 14% 96%;
  --color-accent: 220 14% 45%;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Component Tokens

```css
/* Button tokens */
.btn {
  --btn-padding-x: var(--space-md);
  --btn-padding-y: var(--space-sm);
  --btn-font-size: var(--font-size-base);
  --btn-border-radius: var(--border-radius-md);
  --btn-transition: all 0.2s ease;
}

/* Input tokens */
.input {
  --input-padding-x: var(--space-md);
  --input-padding-y: var(--space-sm);
  --input-font-size: var(--font-size-base);
  --input-border-radius: var(--border-radius-md);
  --input-border-width: 1px;
}
```

## Design System Maintenance

### Version Control

**Design System Versioning**:
- Semantic versioning (major.minor.patch)
- Breaking changes in major versions
- New features in minor versions
- Bug fixes in patch versions

**Change Documentation**:
- Document all design changes
- Maintain changelog
- Communicate breaking changes
- Provide migration guides

### Quality Assurance

**Design Review Process**:
- Peer review for all changes
- Accessibility testing
- Cross-browser testing
- Performance testing

**Testing Checklist**:
- [ ] WCAG 2.1 AA compliance
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance impact
- [ ] Brand consistency

