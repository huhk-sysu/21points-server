import * as http from "http";
import * as express from "express";
import * as socketIO from "socket.io";
import { RoomManager } from "./RoomManager";

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const RoomManagers = new Map<string, RoomManager>();
const socketInRoom = new Map<string, string>();
const roomNames = ["room1", "room2"];

for (const name of roomNames) {
  RoomManagers.set(name, new RoomManager(name));
}

io.on("connection", function (socket) {
  console.log(`${socket.id} connected`);
  socket.on("ready", function (room: string) {
    const roomManager = RoomManagers.get(room);
    const { bluePlayer, redPlayer } = roomManager.getplayers();
    if (!bluePlayer.ready) {
      console.log(`${socket.id} join ${room} as bluePlayer`);
      roomManager.blueSocket = socket.id;
      socket.emit("player", "blue");
      socket.join(room);
      socketInRoom.set(socket.id, room);
      bluePlayer.ready = true;
    } else if (!redPlayer.ready) {
      console.log(`${socket.id} join ${room} as redPlayer`);
      roomManager.redSocket = socket.id;
      socket.emit("player", "red");
      socket.join(room);
      socketInRoom.set(socket.id, room);
      redPlayer.ready = true;
    } else {
      socket.emit("hasError", { msg: "玩家人数已满！" });
      return;
    }
    if (bluePlayer.ready && redPlayer.ready) {
      const { blueCards, redCards } = roomManager.getCards();
      console.log(`===room ${room}, game start===`);
      console.log("blue: " + blueCards);
      console.log("red: " + redCards);
      console.log("======");
      io.to(room).emit("updateCards", { blueCards, redCards });
      io.to(room).emit("begin");
      io.to(roomManager.blueSocket).emit("turn");
    }
  });
  socket.on("getCard", function () {
    const roomManager = RoomManagers.get(socketInRoom.get(socket.id));
    const { blueCards, redCards } = roomManager.getCards();
    roomManager.draw();
    console.log(`===room ${roomManager.name}, new round===`);
    console.log("blue: " + blueCards);
    console.log("red: " + redCards);
    console.log("======");
    io.to(roomManager.name).emit("updateCards", { blueCards, redCards });
    io.to(roomManager.currentPlayerSocket).emit("turn");
  });
  socket.on("stop", function (player: string) {
    const roomManager = RoomManagers.get(socketInRoom.get(socket.id));
    const { blueCards, redCards } = roomManager.getCards();
    console.log(`===room ${roomManager.name}, ${player} stop===`);
    roomManager.stop(player);
    if (roomManager.isBothStop()) {
      const result = roomManager.judge();
      console.log(`===room ${roomManager.name}, result===`);
      console.log("blue: " + blueCards);
      console.log("red: " + redCards);
      console.log("gameover! result:" + result);
      console.log("======");
      io.to(roomManager.name).emit("finish", { status: result, blueCards, redCards });
    } else {
      io.to(roomManager.currentPlayerSocket).emit("turn");
    }
  });
  socket.on("leave", function () {
    const room = socketInRoom.get(socket.id);
    if (room === undefined) return;
    console.log(`${socket.id} left ${room}`);
    socket.leave(room);
    socketInRoom.delete(socket.id);
    const roomManager = RoomManagers.get(room);
    roomManager.someoneLeave();
  });
  socket.on("disconnect", function () {
    console.log(`${socket.id} disconnected`);
    const room = socketInRoom.get(socket.id);
    if (room === undefined) return;
    io.to(room).emit("hasError", { msg: "你的对手断开了连接！" });
    socketInRoom.delete(socket.id);
    const roomManager = RoomManagers.get(room);
    roomManager.someoneLeave();
  });
});

server.listen(3000, function () {
  console.log("the server is running on http://localhost:3000");
});
