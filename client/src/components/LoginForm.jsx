import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const LoginForm = () => {
  const { state, dispatch } = useChat();
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      dispatch({ type: 'SET_USER', payload: username });
      dispatch({ type: 'SET_ROOM', payload: room });
    }
  };

  if (state.currentUser) {
    return null;
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Join the Chat</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="room">Room</label>
          <select
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            <option value="general">General</option>
            <option value="random">Random</option>
            <option value="tech">Tech</option>
            <option value="games">Games</option>
          </select>
        </div>
        <button type="submit" className="btn">
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default LoginForm;