import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../hooks/useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';

const ChatRoom = () => {
  const { state, dispatch } = useChat();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !state.currentUser) return;

    // Join room
    socket.emit('user_join', {
      username: state.currentUser,
      room: state.currentRoom
    });

    // Set up event listeners
    socket.on('room_data', (data) => {
      dispatch({ type: 'SET_ROOM_DATA', payload: data });
    });

    socket.on('receive_message', (message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });

    socket.on('receive_private_message', (message) => {
      dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: message });
    });

    socket.on('users_update', (users) => {
      dispatch({ type: 'UPDATE_USERS', payload: users });
    });

    socket.on('user_joined', (data) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { ...data, type: 'system' }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { id: Date.now(), message: data.message, type: 'info' }
      });
    });

    socket.on('user_left', (data) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { ...data, type: 'system' }
      });
    });

    socket.on('user_typing', (data) => {
      if (data.isTyping) {
        dispatch({ type: 'ADD_TYPING_USER', payload: data.username });
      } else {
        dispatch({ type: 'REMOVE_TYPING_USER', payload: data.username });
      }
    });

    return () => {
      socket.off('room_data');
      socket.off('receive_message');
      socket.off('receive_private_message');
      socket.off('users_update');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
    };
  }, [socket, state.currentUser, state.currentRoom, dispatch]);

  if (!state.currentUser) {
    return null;
  }

  return (
    <div className="chat-app">
      <Sidebar />
      <div className="chat-area">
        <div className="chat-header">
          <h3>#{state.currentRoom}</h3>
          <span>{state.users.length} users online</span>
        </div>
        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatRoom;