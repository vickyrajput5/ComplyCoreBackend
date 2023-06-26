const socketIO = require("socket.io");
const db = require("../api/models");
const User = db.User;
exports.sio = (server) => {
  return socketIO(server, {
    transports: ["polling"],
    cors: {
      origin: "*",
    },
  });
};

exports.connection = (io) => {
  io.on("connection", async (socket) => {
    //  console.log("A user is connected");

    socket.on("send_message", (message) => {
      console.log(`message from ${socket.id} : ${message}`);
      socket.broadcast.emit("user-joined", message);
    });
    //socket.on("message", async (message) => {
    const user = await User.findOne({ where: { role: "company" } });
    socket.broadcast.emit("userUpdated", user);
    //});
    // socket.on("join_room", (data) => {
    //   console.log("join_room", data);
    //   socket.join(data);
    //   console.log(`User with ID: ${socket.id} joined room: ${data}`);
    //   socket.broadcast.emit("user-joined", "Hamza broadcast");
    // });

    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
    socket.on("disconnect", () => {
      //  console.log(`socket ${socket.id} disconnected`);
    });
  });
};
