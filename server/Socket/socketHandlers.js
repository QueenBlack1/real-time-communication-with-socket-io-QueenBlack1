import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
const users = new Map();
const rooms = ['general', 'random', 'tech', 'games'];
const messages = new Map(); // room -> messages array

// Initialize rooms
rooms.forEach(room => {
  messages.set(room, []);
});

export default function socketHandlers(io, socket) {
  console.log('User connected:', socket.id);

  // User joins the chat
  socket.on('user_join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      room: userData.room || 'general',
      isOnline: true,
      lastSeen: new Date()
    };
    
    users.set(socket.id, user);
    
    // Join the room
    socket.join(user.room);
    
    // Notify others in the room
    socket.to(user.room).emit('user_joined', {
      username: user.username,
      message: `${user.username} joined the room`,
      timestamp: new Date()
    });
    
    // Send room info to the user
    const roomUsers = Array.from(users.values()).filter(u => u.room === user.room);
    const roomMessages = messages.get(user.room) || [];
    
    socket.emit('room_data', {
      users: roomUsers,
      messages: roomMessages.slice(-50), // Last 50 messages
      rooms: rooms
    });
    
    // Update user list for everyone in the room
    io.to(user.room).emit('users_update', roomUsers);
  });

  // Handle new messages
  socket.on('send_message', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      username: user.username,
      text: messageData.text,
      room: user.room,
      timestamp: new Date(),
      type: 'message'
    };

    // Store message
    const roomMessages = messages.get(user.room) || [];
    roomMessages.push(message);
    if (roomMessages.length > 100) {
      roomMessages.shift(); // Keep only last 100 messages
    }

    // Broadcast to room
    io.to(user.room).emit('receive_message', message);
  });

  // Handle typing indicators
  socket.on('typing_start', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.room).emit('user_typing', {
        username: user.username,
        isTyping: true
      });
    }
  });

  socket.on('typing_stop', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.room).emit('user_typing', {
        username: user.username,
        isTyping: false
      });
    }
  });

  // Handle private messages
  socket.on('send_private_message', (data) => {
    const fromUser = users.get(socket.id);
    const toUser = Array.from(users.values()).find(u => u.username === data.toUsername);
    
    if (fromUser && toUser) {
      const privateMessage = {
        id: uuidv4(),
        from: fromUser.username,
        to: toUser.username,
        text: data.text,
        timestamp: new Date(),
        type: 'private'
      };

      // Send to recipient
      io.to(toUser.id).emit('receive_private_message', privateMessage);
      
      // Send back to sender for their own chat
      socket.emit('receive_private_message', privateMessage);
    }
  });

  // Handle room changes
  socket.on('change_room', (newRoom) => {
    const user = users.get(socket.id);
    if (!user || !rooms.includes(newRoom)) return;

    // Leave current room
    socket.leave(user.room);
    socket.to(user.room).emit('user_left', {
      username: user.username,
      message: `${user.username} left the room`,
      timestamp: new Date()
    });

    // Join new room
    user.room = newRoom;
    socket.join(newRoom);

    // Notify new room
    socket.to(newRoom).emit('user_joined', {
      username: user.username,
      message: `${user.username} joined the room`,
      timestamp: new Date()
    });

    // Send new room data to user
    const roomUsers = Array.from(users.values()).filter(u => u.room === newRoom);
    const roomMessages = messages.get(newRoom) || [];
    
    socket.emit('room_data', {
      users: roomUsers,
      messages: roomMessages.slice(-50),
      rooms: rooms
    });

    // Update user lists for both rooms
    io.to(user.room).emit('users_update', roomUsers);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      
      socket.to(user.room).emit('user_left', {
        username: user.username,
        message: `${user.username} left the room`,
        timestamp: new Date()
      });

      // Update user list
      const roomUsers = Array.from(users.values()).filter(u => u.room === user.room);
      io.to(user.room).emit('users_update', roomUsers);
    }
    
    console.log('User disconnected:', socket.id);
  });
}