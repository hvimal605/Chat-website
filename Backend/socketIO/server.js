const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "https://harshspark-chat-web.netlify.app", 
            "http://localhost:5173"                    
        ],
        methods: ["GET", "POST"],
    },
});

const users = {};

// Function to get recipient's socket ID
const getRececiverSocketId = (receiverId) => {
    return users[receiverId];
};

io.on("connection", (socket) => {
    console.log('A user connected', socket.id);
    const userId = socket.handshake.query.userId;

    if (userId) {
        users[userId] = socket.id;
        console.log("Hello", users);
    }

    io.emit('getOnlineUsers', Object.keys(users));

    socket.on('typing', (data) => {
        const { senderId, receiverId, isTyping } = data;
        const receiverSocketId = getRececiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing', { senderId, isTyping });
        }
    });

    // Uncomment and modify this section as needed
    // socket.on("sendImage", (data) => {
    //     const { receiverId, image, senderId } = data;
    //     const receiverSocketId = getRececiverSocketId(receiverId);
    //     if (receiverSocketId) {
    //         io.to(receiverSocketId).emit("receiveImage", { image, senderId });
    //     }
    //     console.log("sender" , senderId  ,"to",receiverId , image)
    // });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete users[userId];
        io.emit("getOnlineUsers", Object.keys(users));
    });
});

module.exports = { app, io, server, getRececiverSocketId };
