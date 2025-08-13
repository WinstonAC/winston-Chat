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
    iframe.style.transition = 'height 0.3s ease';
    
    widget.appendChild(iframe);
    
    // Handle resize messages from the iframe
    window.addEventListener('message', function(event) {
      // Verify the message is from our chat widget
      if (event.data && event.data.type === 'winston-chat-resize' && event.data.source === 'winston-chat-widget') {
        const newHeight = event.data.height;
        
        // Ensure minimum and maximum heights
        const minHeight = 400;
        const maxHeight = Math.min(window.innerHeight - 40, 800); // 40px for margins
        const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
        
        // Update iframe height with smooth transition
        iframe.style.height = clampedHeight + 'px';
        
        // Log resize for debugging
        console.log('Winston Chat: Resizing iframe to', clampedHeight + 'px');
      }
    });
    
  } catch (error) {
    console.error('Winston Chat Widget Error:', error);
  }
})(); 