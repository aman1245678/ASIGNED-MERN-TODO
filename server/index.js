const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const PORT = process.env.SOCKET_SERVER_PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "kanban";

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in env");
  process.exit(1);
}
async function main() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });
  app.use(express.json());
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const boards = db.collection("boards");
  let board = await boards.findOne({});
  if (!board) {
    const defaultBoard = {
      columns: [
        { id: "todo", title: "To Do", tasks: [] },
        { id: "inprogress", title: "In Progress", tasks: [] },
        { id: "done", title: "Done", tasks: [] },
      ],
      createdAt: new Date(),
    };
    await boards.insertOne(defaultBoard);
    board = await boards.findOne({});
  }
  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    socket.emit("board:sync", board);

    socket.on("board:update", async (updatedBoard) => {
      try {
        const { _id, ...rest } = updatedBoard;

        await boards.updateOne(
          {},
          { $set: { ...rest, updatedAt: new Date() } }
        );
        board = await boards.findOne({});
        io.emit("board:sync", board);
      } catch (err) {
        console.error("Update error:", err);
      }
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
  app.get("/api/board", async (req, res) => {
    const b = await boards.findOne({});
    res.json(b);
  });

  app.put("/api/board", async (req, res) => {
    try {
      const { _id, ...payload } = req.body;
      await boards.updateOne(
        {},
        { $set: { ...payload, updatedAt: new Date() } }
      );
      const b = await boards.findOne({});
      io.emit("board:sync", b);
      res.json(b);
    } catch (err) {
      console.error("REST update error:", err);
      res.status(500).json({ error: "Failed to update board" });
    }
  });
  server.listen(PORT, () => {
    console.log(`Socket server listening on ${PORT}`);
  });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
