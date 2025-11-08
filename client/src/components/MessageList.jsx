import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';

const MessageList = () => {
  const { state } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="messages-container">
      {state.messages.map((message) => (
        <div
          key={message.id}
          className={`message ${
            message.type === 'system' 
              ? 'system' 
              : message.username === state.currentUser 
              ? 'own' 
              : 'other'
          } ${message.isPrivate ? 'private' : ''}`}
        >
          {message.type !== 'system' && (
            <div className="message-header">
              <span className="username">
                {message.username}
                {message.isPrivate && ' (Private)'}
              </span>
              <span className="timestamp">
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}
          <div className="message-text">{message.text}</div>
        </div>
      ))}
      
      {state.typingUsers.length > 0 && (
        <div className="typing-indicator">
          {state.typingUsers.join(', ')} {state.typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;