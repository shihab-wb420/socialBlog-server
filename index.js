import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({ path: "./.env" });

const port = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined the chat`);
  });

  socket.on("message", (message) => {
    try {
      // Broadcast the message to the specific room
      io.to(message.receiver).emit("message", message);
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


