import React from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { useSocket } from './hooks/useSocket';
import LoginForm from './components/LoginForm';
import ChatRoom from './components/ChatRoom';
import './index.css';

function AppContent() {
  const { state } = useChat();
  const { isConnected } = useSocket();

  return (
    <div className="App">
      {!state.currentUser ? (
        <LoginForm />
      ) : (
        <ChatRoom />
      )}
      
      {/* Connection Status Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '5px 10px',
        background: isConnected ? '#2ecc71' : '#e74c3c',
        color: 'white',
        borderRadius: '3px',
        fontSize: '12px'
      }}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;