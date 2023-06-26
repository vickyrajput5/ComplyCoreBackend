const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const errorHandler = require("./api/middleware/errorHandler");
const colors = require("colors");
const { Server } = require("socket.io");
app.use(cors("*"));
const http = require("http");
//database connection
const db = require("./api/models");
const ChatRooms = db.ChatRooms;
const AdminChats = db.AdminChats;
// parse requests of content-type - application/json
app.use(express.json());
const path = require("path");
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
db.sequelize
  .sync()
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("failed to sync db: " + err.message);
  });
app.get("/", (req, res) => {
  res.json({ message: "Reno App working fine!" });
}); // set port, listen for requests
require("./api/routes/Routes")(app);
app.use(errorHandler);
let port = process.env.PORT;
dotenv.config({
  path: "./config.env",
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
  },
});
const dbHost = process.env.PORT;
console.log(dbHost);
io.on("connection", async (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (data) => {
    console.log("json_data", data);
    // console.log("121212");
    // socket.broadcast.emit("user-joined", "Hamza broadcasting");
    try {
      // if (data.senderId && data.recieverId && data.type && data.roomId) {

      const getData = await ChatRooms.findAll({
        where: {
          senderId: data.senderId,
          recieverId: data.recieverId,
          type: data.type,
        },
      });
      const getDataReciever = await ChatRooms.findAll({
        where: {
          senderId: data.recieverId,
          recieverId: data.senderId,
          type: data.type,
        },
      });
      // const roomIds = parseInt(data.roomId);

      socket.join(data.roomId);
      console.log("data_roomsss", data);
      if (data.offerStatus == "4") {
        const adminchats = await AdminChats.create({
          roomId: data.roomId,
          senderId: data.senderId,
          recieverId: data.recieverId,
          message: data.message,
          author: "Admin",
          offerStatus: data.offerStatus,
        });
      }
      if (getData.length < 1 && getDataReciever.length < 1) {
        if (data?.jobId) {
          var objectData = {
            0: data.jobId,
          };
        }
        var json_data = JSON.stringify(objectData);
        console.log("json_data", json_data);
        const mydata = isValidJSON(objectData);
        const chatroom = await ChatRooms.create({
          senderId: data.senderId,
          recieverId: data.recieverId,
          roomId: data.roomId,
          type: data.type,
          jobIds: json_data || {},
        });

        await chatroom.save();
        // socket.to(data.room).emit("receive_message", "first message");
        // socket.to(data.room).emit("receive_message", {
        //   room: "2",
        //   author: "2",
        //   message: 3,
        //   time: "8:21",
        // });

        //socket.broadcast.emit("receive_message", "Hamza broadcast");
        console.log(`User with ID: ${socket.id} joined room: ${data.roomId}`);
      } else {
        if (data?.jobId) {
          console.log("asdasd");
          const data_new = JSON.parse(getData[0]?.dataValues?.jobIds);
          console.log("getData", data_new);
          const datas = getData[0].dataValues.id + 1;
          data_new[datas] = data.jobId;
          var json_data_new = JSON.stringify(data_new);
          await ChatRooms.update(
            { jobIds: json_data_new },
            { where: { id: getData[0].dataValues.id } }
          );
        }
      }
    } catch (error) {
      socket.emit("receive_error", error);
    }
  });
  // socket.on("old_chat_room", async (data) => {
  //   // socket.broadcast.emit("receive_message", "Hamza broadcast");
  //   const oldchat = await AdminChats.findAll({
  //     where: { senderId: id },
  //     include: [{ model: User, attributes: ["firstName", "lastName"] }],
  //   });
  // });
  socket.on("send_message", async (data) => {
    console.log("mydata", data);
    try {
      //console.log("mydata2", data);
      const roomIds = parseInt(data);
      // const mydata2 = {
      //   roomId: "012",
      //   senderId: 31,
      //   recieverId: 3,
      //   message:
      //     '{"title":"Qqqq","description":"Qqqq","price":"1111","startDate":null,"endDate":null,"offerStatus":1}',
      //   author: "manichangar",
      //   time: "23:14",
      // };
      //console.log();
      // const obj =
      //   typeof data.message === "string" ? JSON.parse(data.message) : null;
      const mydata = isValidJSON(data.message);
      // // console.log("mydata2", obj);
      if (mydata) {
        var offerStatus = 1;
      } else {
        var offerStatus = 0;
      }
      console.log("data", data);
      const adminchats = await AdminChats.create({
        roomId: data.roomId,
        senderId: data.senderId,
        recieverId: data.recieverId,
        message: data.message,
        author: data.author,
        offerStatus: data.offerStatus || offerStatus || 0,
        type: data.type || "text",
      });
      // console.log("adminchats", adminchats);
      // console.log("data", getData[0].dataValues.id);
      data.id = adminchats?.dataValues?.id;
      socket.to(data.roomId).emit("receive_message", data);
    } catch (error) {
      socket.emit("receive_error_msg", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});
function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

// const socketUtils = require("./utils/socketUtils");

// const server = http.createServer(app);
// const io = socketUtils.sio(server);
// socketUtils.connection(io);

// const socketIOMiddleware = (req, res, next) => {
//   req.io = io;

//   next();
// };

// // ROUTES
// app.use("/api/v1/hello", socketIOMiddleware, (req, res) => {
//   req.io.emit("message", `Hello, ${req.originalUrl}`);
//   res.send("hello world!");
// });
// const port = process.env.PORT || 8000;
app.use(express.static(path.join(__dirname, "api/public")));
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// app.listen(port, () => {
//   console.log(
//     `Server is running in ${process.env.NODE_MODE} mode at port ${port}.`.bgCyan
//   );
// });
