"use client";

import { useEffect, useState, useCallback } from "react";
import Board from "@/components/Board";
import io from "socket.io-client";
import axios from "axios";

let socket;

export default function Home() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const serverUrl =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin.replace(":3000", ":4000")
        : "http://localhost:4000";
    socket = io(serverUrl, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
    });

    socket.on("board:sync", (b) => {
      setBoard(b);
      setLoading(false);
    });
    axios
      .get("/api/board")
      .then((res) => {
        if (!board) {
          setBoard(res.data);
          setLoading(false);
        }
      })
      .catch(() => {});

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const emitBoardUpdate = useCallback((updatedBoard) => {
    setBoard(updatedBoard);
    if (socket && socket.connected) {
      socket.emit("board:update", updatedBoard);
      return;
    }
    fetch("/api/board", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBoard),
    }).catch((e) => {
      console.error("Failed to persist board", e);
    });
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!board) return <div style={{ padding: 24 }}>No board found.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Kanban Board</h1>
      <Board board={board} setBoard={emitBoardUpdate} />
      <p style={{ marginTop: 16, color: "#666" }}>
        All changes are optimistic. If persistence fails, UI will attempt to
        revert.
      </p>
    </div>
  );
}
