import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../hooks/useSocket';

const MessageInput = () => {
  const { state } = useChat();
  const { socket } = useSocket();
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('send_message', {
        text: message.trim()
      });
      setMessage('');
      
      // Stop typing indicator
      socket.emit('typing_stop');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing_start');
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop');
      }, 3000);
    }
  };

  const handlePrivateMessage = (username) => {
    const text = prompt(`Send private message to ${username}:`);
    if (text && socket) {
      socket.emit('send_private_message', {
        toUsername: username,
        text: text
      });
    }
  };

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
        disabled={!state.currentUser}
      />
      <button 
        type="submit" 
        className="send-btn"
        disabled={!message.trim() || !state.currentUser}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;