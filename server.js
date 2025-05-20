const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
// DB connection
mongoose.connect('mongodb://localhost:27017/chat-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const MessageSchema = new mongoose.Schema({
    room: String,
    user: String,
    text: String,
    time: String
});
const Message = mongoose.model('Message', MessageSchema);
app.use(express.static('public'));
io.on('connection', socket => {
    console.log('New user connected');

    socket.on('joinRoom', async ({ username, room }) => {
        socket.username = username;
        socket.room = room;
        socket.join(room);

        const messages = await Message.find({ room });
        socket.emit('chatHistory', messages);

        const joinMsg = formatMsg('System', `${username} joined the chat.`, room);
        await joinMsg.save();
        io.to(room).emit('message', joinMsg);
    });
    socket.on('chatMessage', async text => {
        const message = formatMsg(socket.username, text, socket.room);
        await message.save();
        io.to(socket.room).emit('message', message);
    });
    socket.on('clearChat', async room => {
        await Message.deleteMany({ room });
        io.to(room).emit('cleared');
    });
    socket.on('disconnect', async () => {
        if (socket.username && socket.room) {
            const leaveMsg = formatMsg('System', `${socket.username} left the chat.`, socket.room);
            await leaveMsg.save();
            io.to(socket.room).emit('message', leaveMsg);
        }
    });
});
function formatMsg(user, text, room) {
    return new Message({
        room,
        user,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
}
server.listen(PORT,'0.0.0.0',() => console.log(`Server running on port ${PORT}`));
