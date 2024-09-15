const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8000',
    }
});

app.get('/status', (req, res) => {
    res.send("working....");
})

let users = [];
let room = '1'
const nameIdToUserMap = new Map();
const socketToNameId = new Map();

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('room:join', (data) => {
        console.log('Rooms:', users);

        const { nameId, room } = data;


        nameIdToUserMap.set(nameId, socket.id);
        socketToNameId.set(socket.id, nameId);

        users.push({ nameId, socketId: socket.id, room });

        console.log(users);

        io.to(room).emit('user:joined', { nameId, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit('room:join', data);

        io.to(room).emit('room:users', { users: users.filter(usr => usr.room === room) });
    });

    // todo: leave room event
    socket.on("user:message", (data) => {
        const { room, message, from } = data;
        console.log(data, room, message)
        io.to(room).emit('room:message', { from, message });
    });

    socket.on('user:call', (data) => {
        const { to, offer } = data;
        const nameId = socketToNameId.get(socket.id);
        io.to(to).emit('incoming:call', { from: socket.id, offer, nameId });
    });


    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        // console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

    socket.on('disconnect', () => {
        console.log('Rooms', users);

        users = users.filter(({ nameId, socketId }) => socket.id !== socketId);
        io.to(room).emit('room:users', { users: users.filter(usr => usr.room === room) });
        console.log('Disconnect', socket.id);
    });

});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
