import React, { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext();

const initialState = {
  currentUser: null,
  currentRoom: 'general',
  messages: [],
  users: [],
  rooms: [],
  typingUsers: [],
  notifications: []
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ROOM':
      return { ...state, currentRoom: action.payload, messages: [] };
    case 'SET_ROOM_DATA':
      return {
        ...state,
        users: action.payload.users,
        messages: action.payload.messages,
        rooms: action.payload.rooms
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'ADD_PRIVATE_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { ...action.payload, isPrivate: true }]
      };
    case 'UPDATE_USERS':
      return { ...state, users: action.payload };
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: [...state.typingUsers.filter(u => u !== action.payload), action.payload]
      };
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};