import ChatBox from '../app/components/ChatBox';

export default function WinstonWidgetPage() {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        fontFamily: 'monospace',
        background: '#fff',
        color: '#000',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <ChatBox isEmbedded={true} />
    </div>
  );
} 