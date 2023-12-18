import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({ path: "./.env" });

const port = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", ({ sender, receiver }) => {
    const room = `${sender}-${receiver}`;
    socket.join(room);
    console.log(`User ${sender} joined the chat with ${receiver}`);
  });

  socket.on("message", (message) => {
    try {
      // Broadcast the message to the specific room
      const room = `${message.sender}-${message.receiver}`; 
      console.log("message",message)
      io.to(room).emit("message", message);
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running at 👉 http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed !! ", error);
  });


