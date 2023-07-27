import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

export const io = new Server(server);

interface RoomUser {
  socket_id: string;
  username: string;
  room: string;
}

const users: RoomUser[] = [];

interface Message {
  room: string;
  message: string;
  username: string;
  createdAt: Date;
}

const messages: Message[] = [];

io.of("/chat").on("connection", (socket) => {
  console.log(`connection chat id: ${socket.id}`);

  socket.on("select_room", (data, callback) => {
    socket.join(data.room);

    const userInRoom = users.find(
      (user) => user.username === data.username && user.room === data.room
    );

    if (userInRoom) {
      userInRoom.socket_id = socket.id;
    } else {
      users.push({
        socket_id: socket.id,
        username: data.username,
        room: data.room,
      });
    }

    const messagesRoom = messages.filter(
      (message) => message.room === data.room
    );

    callback(messagesRoom);
  });

  socket.on("chat_message", (data) => {
    const message: Message = {
      message: data.message,
      username: data.username,
      room: data.room,
      createdAt: new Date(),
    };

    messages.push(message);

    io.of("/chat").to(data.room).emit("chat_message", message);
  });
});

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
  console.log("listening on 3000");
});
