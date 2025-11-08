import React from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../hooks/useSocket';

const Sidebar = () => {
  const { state, dispatch } = useChat();
  const { socket } = useSocket();

  const handleRoomChange = (room) => {
    if (socket && room !== state.currentRoom) {
      socket.emit('change_room', room);
      dispatch({ type: 'SET_ROOM', payload: room });
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
    <div className="sidebar">
      <div className="user-info">
        <h3>{state.currentUser}</h3>
        <p>Online in #{state.currentRoom}</p>
      </div>
      
      <div className="rooms-list">
        <h4>Rooms</h4>
        {state.rooms.map(room => (
          <div
            key={room}
            className={`room-item ${room === state.currentRoom ? 'active' : ''}`}
            onClick={() => handleRoomChange(room)}
          >
            #{room}
          </div>
        ))}
      </div>
      
      <div className="users-list">
        <h4>Online Users ({state.users.length})</h4>
        {state.users.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-status"></div>
            <span>{user.username}</span>
            {user.username !== state.currentUser && (
              <button
                onClick={() => handlePrivateMessage(user.username)}
                style={{ 
                  marginLeft: 'auto', 
                  background: 'none', 
                  border: 'none', 
                  color: '#3498db',
                  cursor: 'pointer'
                }}
              >
                PM
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;