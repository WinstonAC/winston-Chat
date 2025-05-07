// Winston Chat Embed Script
(function() {
  try {
    // Create the chat widget container
    const widget = document.createElement('div');
    widget.id = 'winston-chat-widget';
    widget.style.position = 'fixed';
    widget.style.bottom = '20px';
    widget.style.right = '20px';
    widget.style.zIndex = '9999';
    
    // Add the widget to the page
    document.body.appendChild(widget);
    
    // Load the chat iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://chat.winstonai.io/embed';
    iframe.style.border = 'none';
    iframe.style.width = '400px';
    iframe.style.height = '600px';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    widget.appendChild(iframe);
  } catch (error) {
    console.error('Winston Chat Widget Error:', error);
  }
})(); 